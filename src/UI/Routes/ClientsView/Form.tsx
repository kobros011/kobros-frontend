import { queryKeyClients, queryKeyDefault } from '@/constants/queryKeys';
import useUnsavedChangesGuard from '@/infrastructure/hooks/useUnsavedChangesGuard';
import routePaths from '@/constants/routePaths';
import { TypeUser } from '@/constants/types';
import { Client, ClientLoanDraft } from '@/domain/Client';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getClient, useMutationType } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import { ClientContactsList } from './ClientContactsList';
import { ClientRoutesSection } from './priority/ClientRoutesSection';
import { ClientRoutesPicker } from './priority/ClientRoutesPicker';
import { ClientLoanSection, resolveLoanRouteId } from './ClientLoanSection';
import { confirmWithinAvailableCash } from '@/UI/Routes/LoansView/availableCash';
import { parseFormNumber } from '@/infrastructure/utils/formaNumber';
import { queryKeyCollection, queryKeyLoans, queryKeyPayments, queryKeyReports } from '@/constants/queryKeys';
import { useCanManagePriority } from './priority/usePriorityAccess';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { ClientCreditSummary } from '@components/ClientCreditSummary';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import PageTitle from '@/UI/Components/PageTitle';
import FormFooter from '@/UI/Components/FormFooter';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useModuleCustomFields from '@/infrastructure/hooks/useModuleCustomFields';
import { useQueryClient } from '@tanstack/react-query';
import { CheckOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Collapse, Divider, Flex, Form, Result, Row, Typography } from 'antd';
import { ClientFields } from './ClientFields';
import { customFieldsPayload, displayCustomValue } from './customFieldsPayload';
import { buildClientFormView, ClientFormConfigContext, useClientFormConfig } from '@/infrastructure/hooks/useClientFormConfig';
import { getSettings } from '@/infrastructure/querys/Settings';
import usePageTitle from '@/infrastructure/hooks/usePageTitle';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import { ContactKind } from '@/domain/Client';

const { Title } = Typography;
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useMemo, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';

const FormClient: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Client>>();
	
	const { typeUser, brandId } = useUserStore(state => state.user);
	const isDev = typeUser == TypeUser.dev;

	const isMobile = useUserModeStore(state => state.isMobile);
	const { notification, modal } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { client, isLoading: isLoadingClient, isRefetching, isError, error: errorClient } = getClient(id);
	const clientMutation = useMutationType(id ? 'update' : 'create');

	const [submitted, setSubmitted] = useState(false);
	const [errorCount, setErrorCount] = useState(0);
	const ownConfig = useClientFormConfig();
	// Desarrollador: no tiene marca propia, así que los campos salen de la marca del cliente (o de la elegida al crear).
	const watchedBrand = Form.useWatch('brandId', form);
	const targetBrand = isDev ? (client?.brandId || watchedBrand || undefined) : undefined;
	const { settings: brandSettings } = getSettings(targetBrand, isDev && !!targetBrand);
	const config = useMemo(
		() => (isDev && targetBrand && brandSettings ? buildClientFormView(brandSettings.formConfig.clients) : ownConfig),
		[isDev, targetBrand, brandSettings, ownConfig],
	);
	const contactKinds = (['fiador', 'referencia'] as ContactKind[]).filter(kind => config.isSectionVisible(kind));

	const isCreate = !id;
	const { bindForm, markClean } = useUnsavedChangesGuard(readonly ? false : undefined);
	const pageTitle = isCreate ? 'Nuevo cliente' : readonly ? 'Ver cliente' : 'Editar cliente';
	// En móvil el título va en la barra del layout (icono + texto, a la izquierda) y la tarjeta no lo repite; con logo de marca la barra muestra el logo y el título se queda en la tarjeta.
	const hasBrandLogo = useAppSettingsStore(state => !!(state.logoFullUrl || state.logoMarkUrl));
	const titleInLayout = isMobile && !hasBrandLogo;
	usePageTitle(titleInLayout ? pageTitle : undefined);
	const listPath = `/${routePaths.DEFAULT_HOME}/${routePaths.CLIENTS}`;
	const canManagePriority = useCanManagePriority();

	const assignments = Form.useWatch('routeAssignments', form);
	const routeIds = (assignments ?? []).map(item => item.routeId);
	// Campos personalizados del crédito que se crea junto con el cliente (marca de la ruta del crédito).
	const loanDraft = Form.useWatch('loan', form) as Partial<ClientLoanDraft> | undefined;
	const allRoutes = useRouteStore(state => state.routes);
	const loanRoute = allRoutes.find(item => item.id === resolveLoanRouteId(routeIds, loanDraft?.routeId));
	const { activeCustomFields: loanCustomFields } = useModuleCustomFields('loans', loanRoute?.brandId);

	/** El crédito solo se envía si se llenó alguno de sus datos principales; la ruta es la única (o la elegida entre varias). */
	const buildLoan = (loan?: Partial<ClientLoanDraft>): ClientLoanDraft | undefined => {
		const started = [loan?.valueCapital, loan?.valueQuotaFixed, loan?.agreedQuotas, loan?.paymentMethod].some(value => value !== undefined && value !== null && value !== '');
		const routeId = resolveLoanRouteId(routeIds, loan?.routeId);
		return started && loan && routeId ? { ...(loan as ClientLoanDraft), routeId, customFields: customFieldsPayload(loan.customFields, loanCustomFields) } : undefined;
	};

	const onFinish = async (values: Partial<Omit<Client, 'loansNumber'>>) => {
		setErrorCount(0);
		const loan = isCreate ? buildLoan(values.loan) : undefined;
		// Con crédito: si el capital supera el efectivo disponible en la ruta, se confirma antes de guardar.
		if (loan && !(await confirmWithinAvailableCash(modal, loan.routeId, parseFormNumber(loan.valueCapital)))) return;

		// Fiadores y referencias: las secciones ocultas no se envían; un fiador requerido es obligatorio.
		const contacts = values.contacts?.filter(contact => config.isSectionVisible(contact.kind));
		if (config.isSectionRequired('fiador') && !(contacts ?? []).some(contact => contact?.kind === 'fiador')) {
			notification.error({ message: 'Debes agregar al menos un fiador' });
			return;
		}

		startLoading();
		clientMutation.mutate({
			...client,
			...values,
			...(contacts ? { contacts } : {}),
			customFields: customFieldsPayload(values.customFields as Record<string, unknown>, config.activeCustomFields),
			brandId: values.brandId ? values.brandId : brandId,
			// Al crear, las rutas y prioridades salen del selector del formulario (el servidor las valida y aplica en una sola transacción).
			...(isCreate ? { routeAssignments: values.routeAssignments, loan } : {}),
		}, {
			onSuccess: (response) => {
				markClean();
				const loanNumber = response?.data?.loan_number;
				notification.success({ message: loanNumber ? `Cliente creado y crédito #${loanNumber} creado` : `El cliente fue ${isCreate ? 'creado' : 'actualizado'} exitosamente` });
				if (loanNumber) {
					// Un crédito nuevo mueve cartera, cobro del día, pagos y reportes.
					for (const key of [queryKeyLoans.base, queryKeyPayments.base, queryKeyCollection.base, queryKeyReports.base]) void queryClient.invalidateQueries({ queryKey: [key] });
				}
				stopLoading();
				void queryClient.invalidateQueries({ queryKey: [queryKeyClients.base, queryKeyDefault.list], exact: false });
				void navigate(listPath, { replace: true });
			},
			onError: (error) => {
				stopLoading();
				notification.error({ message: handleError(error, `Ocurrió un error al ${isCreate ? 'crear' : 'actualizar'} el cliente`) });
			},
		});
	};

	if (isLoadingClient) {
		return <LoadingComponent label="Cargando cliente" fullHeight />;
	}

	if (isError) {
		const axiosError = errorClient as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorClient, 'Error al obtener el cliente')}
				subTitle={axiosError.message ?? 'Error al obtener el cliente'}
			/>
		);
	}

	return (
		<ClientFormConfigContext.Provider value={config}>
			<Card
				title={titleInLayout ? undefined : <PageTitle icon={isCreate ? <UserAddOutlined /> : <UserOutlined />} title={pageTitle} />}
				className="kb-form-card"
			>
				<Form
					form={form}
					{...bindForm(form)}
					layout="vertical"
					key={client ? `${client.id}-${client.updatedAt}` : 'new'}
					initialValues={client ? client : {}}
					disabled={isRefetching || isLoading || readonly}
					onFinish={values => void onFinish(values)}
					onFinishFailed={info => { setSubmitted(true); setErrorCount(info.errorFields.length); }}
				>
					{errorCount > 0 && (
						<Alert type="error" showIcon style={{ marginBottom: 16 }} message={`Revisa ${errorCount} ${errorCount === 1 ? 'campo' : 'campos'} antes de guardar`} />
					)}
					<Row gutter={[16, 0]}>
						<ClientFields isDev={isDev} isCreate={isCreate} />
						{contactKinds.length > 0 && (
							<Col xs={24}>
								<ClientContactsList kinds={contactKinds} />
							</Col>
						)}
					</Row>
					{!isCreate && config.archivedCustomFields.length > 0 && (
						<Collapse
							ghost
							items={[{
								key: 'archived',
								label: `Campos archivados (${config.archivedCustomFields.length})`,
								children: (
									<Flex vertical gap={8}>
										{config.archivedCustomFields.map(field => (
											<Flex key={field.key} justify="space-between" gap={8}>
												<Typography.Text type="secondary">{field.label}</Typography.Text>
												<Typography.Text>{displayCustomValue(client?.customFields?.[field.key], field)}</Typography.Text>
											</Flex>
										))}
									</Flex>
								),
							}]}
						/>
					)}
					{isCreate && (
						<Form.Item
							name="routeAssignments"
							rules={[{ validator: (_, assigned?: unknown[]) => (assigned?.length ? Promise.resolve() : Promise.reject(new Error('Elige al menos una ruta'))) }]}
						>
							<ClientRoutesPicker />
						</Form.Item>
					)}
					{isCreate && routeIds.length > 0 && <ClientLoanSection form={form} routeIds={routeIds} submitted={submitted} />}
				</Form>

				{id && client && <ClientRoutesSection client={client} canManage={canManagePriority} readonly={readonly} />}

				{id && (
					<>
						<Divider style={{ marginTop: 8 }} />
						<Title level={5} style={{ marginBottom: 12 }}>
							Historial de créditos
						</Title>
						<ClientCreditSummary clientId={id} />
					</>
				)}

				<FormFooter>
					<Button type="primary" danger ghost onClick={() => void navigate(listPath)} disabled={isLoading}>
						{readonly ? 'Volver' : 'Cancelar'}
					</Button>
					{!readonly && (
						<Button type="primary" icon={<CheckOutlined />} loading={isRefetching || isLoading} onClick={form.submit}>
							{id ? 'Guardar cliente' : 'Crear cliente'}
						</Button>
					)}
				</FormFooter>
			</Card>
		</ClientFormConfigContext.Provider>
	);
};

export default FormClient;