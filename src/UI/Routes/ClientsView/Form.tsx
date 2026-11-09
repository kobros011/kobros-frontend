import { spanConfigForm } from '@/constants/getSpan';
import { queryKeyClients, queryKeyDefault } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { ruleRequired } from '@/constants/rules';
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
import { queryKeyCollection, queryKeyLoans, queryKeyPayments, queryKeyReports } from '@/constants/queryKeys';
import { useCanManagePriority } from './priority/usePriorityAccess';
import ActionsButton from '@/UI/Components/AcctionButtons';
import { ClientCreditSummary } from '@components/ClientCreditSummary';
import InputDate from '@/UI/Components/Fields/InputDate';
import { SelectBrand } from '@/UI/Components/Fields/SelectBrand';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Card, Col, Divider, Form, Input, Result, Row, Typography } from 'antd';

const { Title } = Typography;
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';

const FormClient: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Client>>();
	
	const { typeUser, brandId } = useUserStore(state => state.user);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { client, isLoading: isLoadingClient, isRefetching, isError, error: errorClient } = getClient(id);
	const clientMutation = useMutationType(id ? 'update' : 'create');

	const [exit, setExit] = useState<boolean>(false);
	const [submitted, setSubmitted] = useState(false);

	const isCreate = !id;
	const canManagePriority = useCanManagePriority();

	const isDev = typeUser == TypeUser.dev;
	const assignments = Form.useWatch('routeAssignments', form);
	const routeIds = (assignments ?? []).map(item => item.routeId);

	/** El crédito solo se envía si se llenó alguno de sus datos principales; la ruta es la única (o la elegida entre varias). */
	const buildLoan = (loan?: Partial<ClientLoanDraft>): ClientLoanDraft | undefined => {
		const started = [loan?.valueCapital, loan?.valueQuotaFixed, loan?.agreedQuotas, loan?.paymentMethod].some(value => value !== undefined && value !== null && value !== '');
		const routeId = resolveLoanRouteId(routeIds, loan?.routeId);
		return started && loan && routeId ? { ...(loan as ClientLoanDraft), routeId } : undefined;
	};

	const onFinish = (values: Partial<Omit<Client, 'loansNumber'>>) => {
		startLoading();
		clientMutation.mutate({
			...client,
			...values,
			brandId: values.brandId ? values.brandId : brandId,
			// Al crear, las rutas y prioridades salen del selector del formulario (el servidor las valida y aplica en una sola transacción).
			...(isCreate ? { routeAssignments: values.routeAssignments, loan: buildLoan(values.loan) } : {}),
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				const loanNumber = response?.data?.loan_number;
				notification.success({ message: loanNumber ? `Cliente creado y crédito #${loanNumber} creado` : `El cliente fue ${isCreate ? 'creado' : 'actualizado'} exitosamente` });
				if (loanNumber) {
					// Un crédito nuevo mueve cartera, cobro del día, pagos y reportes.
					for (const key of [queryKeyLoans.base, queryKeyPayments.base, queryKeyCollection.base, queryKeyReports.base]) void queryClient.invalidateQueries({ queryKey: [key] });
				}
				stopLoading();

				if (exit) {
					void queryClient.invalidateQueries({
						queryKey: [queryKeyClients.base, queryKeyDefault.list],
						exact: false,
					});
					setExit(false);
					form.resetFields();
					void navigate(-1);
					return;
				}

				if (isCreate && data) {
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.CLIENTS}/${data?.id}/editar`, { replace: true });
				}
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
		<Card
			title={`${isCreate ? 'Crear' : readonly ? 'Ver' : 'Actualizar'} cliente`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Form
				form={form}
				layout="vertical"
				key={client ? `${client.id}-${client.updatedAt}` : 'new'}
				initialValues={client ? client : {}}
				disabled={isRefetching || isLoading || readonly}
				onFinish={onFinish}
				onFinishFailed={() => setSubmitted(true)}
			>
				<Row gutter={[16, 0]}>
					{(isDev) &&
						<Col {...spanConfigForm.medium}>
							<Form.Item
								label="Marca"
								name={'brandId'}
								rules={[ ruleRequired ]}
							>
								<SelectBrand disabled={!isCreate} />
							</Form.Item>
						</Col>
					}
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Nombre completo"
							name={'fullName'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Nombre completo del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Documento"
							name={'idDocument'}
							rules={[ ruleRequired ]}
						>
							<Input inputMode="numeric" placeholder="Documento del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Celular"
							name={'currentMobile'}
							rules={[ ruleRequired ]}
						>
							<Input inputMode="tel" placeholder="Celular del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Dirección"
							name={'currentAddress'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Dirección del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Barrio"
							name={'neighborhood'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Barrio del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Teléfono"
							name={'currentPhone'}
						>
							<Input inputMode="tel" placeholder="Teléfono del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Fecha vinculación"
							name={'linkingDate'}
							rules={[ ruleRequired ]}
						>
							<InputDate useCurrentDate disabled={!isCreate} placeholder="Fecha vinculación del cliente" />
						</Form.Item>
					</Col>

					<Col xs={24}>
						<ClientContactsList />
					</Col>
				</Row>
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

			<ActionsButton
				textAction={id ? 'Actualizar' : 'Crear'}
				hiddenSave={readonly}
				hiddenSaveAndExit={readonly}
				isLoading={isRefetching || isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={form.submit}
				onClickSaveExit={() => { form.submit(); setExit(true); }}
			/>
		</Card>
	);
};

export default FormClient;