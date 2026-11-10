import { Route } from '@/domain/Route';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getClientMoreInfo } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import { App, Card, Collapse, CollapseProps, Form } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { Result } from 'antd/lib';
import { AxiosError } from 'axios';
import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recalculateLoanForm } from './Hooks/useChangeDataLoan';
import { nameRequiredFilesLoan, nameRequiredFilesLoanMessage } from '@/constants/requieredFiles';
import { getListLoans, useMutationType } from '@/infrastructure/querys/Loan';
import { useClientRoutes } from '@/infrastructure/hooks/useClientRoute';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { LoanFull } from '@/domain/Loan';
import { ClientInfoStep } from './components/ClientInfoStep';
import { LoanHistoryStep } from './components/LoanHistoryStep';
import { LoanDataStep } from './components/LoanDataStep';
import { confirmWithinAvailableCash } from './availableCash';
import { parseFormNumber } from '@/infrastructure/utils/formaNumber';
import { StepHeader } from './components/StepHeader';
import { LoanWizardShell } from './components/LoanWizardShell';
import { CurrencyProvider } from '@/infrastructure/hooks/useMoney';

/** Ruta mínima para llamar API antes de que el store de rutas termine de cargar. */
const routePlaceholder = (id: string): Route => ({
	id,
	name: '',
	initialExpense: '',
	initialValue: '',
	openingDate: '',
	brandId: '',
	allowedUsersIds: [],
	currency: '',
	loansNumber: 0,
	active: true,
	createdAt: '',
	updatedAt: '',
});

const resolveRouteFromNavigation = (
	routes: Route[],
	routeIds?: string[],
): Route | undefined => {
	if (routes.length === 1) return routes[0];
	if (routeIds?.length === 1) {
		const id = routeIds[0];
		return routes.find(item => item.id === id) ?? routePlaceholder(id);
	}
	if (routeIds && routeIds.length > 1) return undefined;
	return undefined;
};

const FormLoan: FC = () => {
	const { state } = useLocation() as { state?: { clientId?: string; routeIds?: string[] } };
	const clientId = state?.clientId;
	const routeIds = state?.routeIds;

	const [form] = Form.useForm<Partial<LoanFull>>();
	const { routes, resetStore } = useRouteStore(store => store);
	useRoutes();

	const availableRoutes = routes.filter(item => routeIds?.includes(item.id));

	const [availableRoute, setAvailableRoute] = useState<Route | undefined>(() =>
		resolveRouteFromNavigation(routes, routeIds),
	);
	const [availableClientId, setAvailableClientId] = useState<string | undefined>(clientId);

	const [activeKey, setActiveKey] = useState<string | string[]>(['client']);
	const [step1Done, setStep1Done] = useState(false);
	const [step2Done, setStep2Done] = useState(false);

	const { notification, modal } = App.useApp();
	const navigate = useNavigate();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { client, isError: isErrorClient, error: errorClient, refetch, isLoading: isLoadingClient, isFetching: isFetchingClient } =
		getClientMoreInfo(availableClientId, availableRoute?.id);

	// Mismo listado que usa el historial (paso 2): con un cliente sin créditos el paso 2 se omite solo.
	const { loans: clientLoans } = getListLoans({ clientId: availableClientId }, !!availableClientId);

	const { clientRoutes, getClientRoutes } = useClientRoutes(availableRoute?.id);
	const loanMutation = useMutationType('create');

	useEffect(() => {
		if (availableRoute?.id) return;

		const resolved = resolveRouteFromNavigation(routes, routeIds);
		if (resolved) setAvailableRoute(resolved);
	}, [routes, routeIds, availableRoute?.id]);

	useEffect(() => {
		if (!availableRoute?.id) return;
		const enriched = routes.find(r => r.id === availableRoute.id);
		if (enriched?.name && !availableRoute.name) {
			setAvailableRoute(enriched);
		}
	}, [routes, availableRoute?.id, availableRoute?.name]);

	useEffect(() => {
		if (!availableRoute?.id) return;
		void getClientRoutes(availableRoute.id);
	}, [availableRoute?.id, getClientRoutes]);

	const getInitialValues = (): Partial<LoanFull> => {
		if (client) {
			return {
				idDocument: client.idDocument,
				fullName: client.fullName,
				currentMobile: client.currentMobile,
				currentAddress: client.currentAddress,
				routeName: client.routeName,
				order: client.order,
				loanNumber: (availableRoute?.loansNumber ?? 0) + 1,
				valueCapital: undefined,
				valueQuotaFixed: undefined,
				agreedQuotas: undefined,
				paymentMethod: undefined,
				valuePayment: undefined,
			};
		}
		return {};
	};

	// Se reinicia el formulario solo si cambian los datos que copia del cliente: guardar fiadores o referencias
	// (que también refresca `client`) no debe borrar lo que ya se digitó del crédito.
	const clientKey = client ? JSON.stringify([client.id, client.idDocument, client.fullName, client.currentMobile, client.currentAddress, client.routeName, client.order]) : '';
	useEffect(() => {
		form.setFieldsValue(getInitialValues());
	}, [clientKey, availableRoute?.loansNumber]);

	const saveLoan = (values: Partial<LoanFull>) => {
		loanMutation.mutate(
			{
				...values,
				clientrouteId: clientRoutes.find(item => item.clientId == client?.id)?.id,
				clientId: client?.id,
			},
			{
				onSuccess: (response) => {
					// El servidor asigna el número real del crédito.
					const created = response?.data?.loan_number;
					notification.success({ message: created ? `El crédito #${created} fue creado exitosamente` : 'El crédito fue creado exitosamente' });
					void refetch();
					void resetStore();
					stopLoading();
					form.resetFields();
					void navigate(-1);
				},
				onError: (error) => {
					stopLoading();
					notification.error({ message: handleError(error, 'Ocurrió un error al crear el crédito') });
				},
			},
		);
	};

	const handleSubmit = async () => {
		recalculateLoanForm(form);
		const values = form.getFieldsValue();
		const keysValues = Object.keys(values) as Array<keyof LoanFull>;
		const emptyValuesKeys = keysValues.filter(key => {
			const v = values[key];
			return v === '' || v === undefined || v === null || v === 0;
		});

		if (emptyValuesKeys.some(key => nameRequiredFilesLoan.includes(key))) {
			notification.error({
				message: nameRequiredFilesLoanMessage.find(item => emptyValuesKeys.includes(item.key))?.message,
			});
			return;
		}

		if (!(await confirmWithinAvailableCash(modal, availableRoute?.id, parseFormNumber(values.valueCapital)))) return;

		startLoading();
		saveLoan(values);
	};

	const openKeys = Array.isArray(activeKey) ? activeKey : activeKey ? [activeKey] : [];
	const isPanelActive = (key: string) => openKeys.includes(key);

	const handleCollapseChange = (keys: string | string[]) => {
		const next = Array.isArray(keys) ? keys : keys ? [keys] : [];
		const allowed = next.filter((k) => {
			if (k === 'client') return true;
			if (k === 'history') return step1Done;
			if (k === 'data') return step2Done;
			return false;
		});
		setActiveKey(allowed);
	};

	if (availableClientId && availableRoute?.id && isErrorClient) {
		const axiosError = errorClient as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorClient, 'Error al obtener la información del cliente')}
				subTitle={axiosError.message ?? 'Error al obtener la información del cliente'}
			/>
		);
	}

	const collapseItems: CollapseProps['items'] = [
		{
			key: 'client',
			collapsible: 'header',
			label: (
				<StepHeader
					n={1}
					title="Info del Cliente"
					done={step1Done}
					active={isPanelActive('client')}
					statusTag={step1Done ? 'Completado' : undefined}
				/>
			),
			children: (
				<ClientInfoStep
					form={form}
					client={client}
					clientId={availableClientId}
					routeId={availableRoute?.id}
					routeName={availableRoute?.name}
					routes={availableRoutes.length > 0 ? availableRoutes : routes}
					hasRoute={!!availableRoute?.id}
					hasClientId={!!availableClientId}
					isLoadingClient={isLoadingClient || isFetchingClient}
					onRouteSelected={(route) => {
						setAvailableRoute(route);
						void getClientRoutes(route.id);
					}}
					onClientSelected={(id) => setAvailableClientId(id)}
					onContinue={() => {
						setStep1Done(true);
						if (clientLoans?.length === 0) {
							// Primer crédito: no hay historial que revisar, se pasa directo a los datos del crédito.
							setStep2Done(true);
							setActiveKey(['data']);
							return;
						}
						setActiveKey((prev) => [...new Set([...(Array.isArray(prev) ? prev : [prev]), 'history'])]);
					}}
					onClientSaved={() => void refetch()}
				/>
			),
		},
		{
			key: 'history',
			collapsible: step1Done ? 'header' : 'disabled',
			label: (
				<StepHeader
					n={2}
					title="Historial del Cliente"
					done={step2Done}
					active={isPanelActive('history')}
					locked={!step1Done}
					statusTag={
						step2Done
							? 'Completado'
							: isPanelActive('history') && step1Done
								? 'En revisión'
								: !step1Done
									? 'Pendiente'
									: undefined
					}
				/>
			),
			children: availableClientId ? (
				<LoanHistoryStep
					clientId={availableClientId}
					onContinue={() => {
						setStep2Done(true);
						setActiveKey((prev) => [...new Set([...(Array.isArray(prev) ? prev : [prev]), 'data'])]);
					}}
				/>
			) : null,
		},
		{
			key: 'data',
			collapsible: step2Done ? 'header' : 'disabled',
			label: (
				<StepHeader
					n={3}
					title="Datos del Crédito"
					active={isPanelActive('data')}
					locked={!step2Done}
					statusTag={
						isPanelActive('data') && step2Done ? 'En revisión' : !step2Done ? 'Pendiente' : undefined
					}
				/>
			),
			children: (
				<LoanDataStep
					form={form}
					routeId={availableRoute?.id}
					disabled={isLoading}
					onCancel={() => void navigate(-1)}
					onSave={() => void handleSubmit()}
					isLoading={isLoading}
				/>
			),
		},
	];

	return (
		<CurrencyProvider routeId={availableRoute?.id}>
			<Card
				title="Crear crédito"
				style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
			>
				<LoanWizardShell>
					<Form form={form} layout="vertical">
						<Collapse
							activeKey={activeKey}
							onChange={handleCollapseChange}
							items={collapseItems}
						/>
					</Form>
				</LoanWizardShell>
			</Card>
		</CurrencyProvider>
	);
};

export default FormLoan;
