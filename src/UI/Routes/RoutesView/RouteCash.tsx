import { FC, useState } from 'react';
import { App, Collapse, Form, Input, Modal, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import { ruleRequired } from '@/constants/rules';
import { getRouteCashSummary, getListRouteMovements, useCreateRouteMovement } from '@/infrastructure/querys/RouteMovement';
import { RouteMovementType } from '@/domain/RouteMovement';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { DashboardShell, KpiCard } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useTableViewStore from '@/infrastructure/context/TableViewStore';
import MovementHistory from './MovementHistory';

const { Text } = Typography;

const MOVEMENTS_MODULE = 'route-movements';
const DEFAULT_PAGE_SIZE = 10;

interface MovementFormValues {
	value: string | number;
	concept: string;
}

const RouteCash: FC<{ routeId: string }> = ({ routeId }) => {
	const { notification } = App.useApp();
	const [form] = Form.useForm<MovementFormValues>();
	const [modalType, setModalType] = useState<RouteMovementType | null>(null);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const isMobile = useUserModeStore(state => state.isMobile);
	const modulePrefs = useTableViewStore(state => state.modules[MOVEMENTS_MODULE]);
	const setViewMode = useTableViewStore(state => state.setViewMode);
	const viewMode = modulePrefs?.viewMode ?? (isMobile ? 'list' : 'table');

	const { summary, isLoading: loadingSummary } = getRouteCashSummary(routeId);
	const { movements, total, isLoading: loadingMovements } = getListRouteMovements(routeId, page, pageSize);
	const createMovement = useCreateRouteMovement();

	const closeModal = () => {
		setModalType(null);
		form.resetFields();
	};

	const onSubmit = (values: MovementFormValues) => {
		if (!routeId || !modalType) return;
		createMovement.mutate(
			{ route_id: routeId, type: modalType, value: Number(values.value), concept: values.concept },
			{
				onSuccess: () => {
					notification.success({ message: modalType === 'INGRESO' ? 'Ingreso registrado' : 'Retiro registrado' });
					setPage(1);
					closeModal();
				},
				onError: (error: unknown) => {
					const data = error instanceof AxiosError
						? (error.response?.data as { detail?: string; error?: string } | undefined)
						: undefined;
					notification.error({ message: data?.detail ?? data?.error ?? 'No se pudo registrar el movimiento' });
				},
			},
		);
	};

	const onPageChange = (nextPage: number, nextPageSize: number) => {
		setPage(nextPage);
		setPageSize(nextPageSize);
	};

	if (loadingSummary && !summary) {
		return <LoadingComponent label="Cargando caja de la ruta" fullHeight />;
	}

	const saldo = summary?.saldo ?? 0;

	const saldoCard = (
		<KpiCard
			label="Saldo de caja"
			subtitle="Disponible para operar"
			icon={<WalletOutlined />}
			value={formatCOP(saldo)}
			unit="COP"
			valueTone={saldo < 0 ? 'danger' : undefined}
		/>
	);

	const otherKpiCards = [
		<KpiCard key="ingresos" label="Ingresos acumulados" subtitle="Dinero agregado a la ruta" icon={<ArrowUpOutlined />} tone="ok" valueTone="ok" value={formatCOP(summary?.ingresos ?? 0)} unit="COP" />,
		<KpiCard key="retiros" label="Retiros acumulados" subtitle="Dinero retirado de la ruta" icon={<ArrowDownOutlined />} tone="danger" valueTone="danger" value={formatCOP(summary?.retiros ?? 0)} unit="COP" />,
		<KpiCard key="inicial" label="Valor inicial" subtitle="Base con la que abrió la ruta" tone="neutral" value={formatCOP(summary?.initialValue ?? 0)} unit="COP" />,
		<KpiCard key="cobros" label="Cobros" subtitle="Pagos recaudados en la ruta" tone="neutral" value={formatCOP(summary?.cobros ?? 0)} unit="COP" />,
		<KpiCard key="gastos" label="Gastos" subtitle="Gastos registrados en la ruta" tone="neutral" value={formatCOP(summary?.gastos ?? 0)} unit="COP" />,
		<KpiCard key="desembolsos" label="Préstamos desembolsados" subtitle="Capital entregado a clientes" tone="neutral" value={formatCOP(summary?.desembolsos ?? 0)} unit="COP" />,
	];

	return (
		<DashboardShell>
			{isMobile ? (
				<>
					{saldoCard}
					<Collapse
						size="small"
						items={[{ key: 'kpis', label: 'Ver desglose', children: <div className="kb-grid-kpi">{otherKpiCards}</div> }]}
					/>
				</>
			) : (
				<div className="kb-grid-kpi">
					{saldoCard}
					{otherKpiCards}
				</div>
			)}

			<MovementHistory
				movements={movements}
				total={total}
				page={page}
				pageSize={pageSize}
				onPageChange={onPageChange}
				isLoading={loadingMovements}
				isMobile={isMobile}
				viewMode={viewMode}
				onViewModeChange={mode => setViewMode(MOVEMENTS_MODULE, mode)}
				onIngresar={() => setModalType('INGRESO')}
				onRetirar={() => setModalType('RETIRO')}
			/>

			<Modal
				open={modalType !== null}
				title={modalType === 'INGRESO' ? 'Ingresar dinero a la ruta' : 'Retirar dinero de la ruta'}
				okText={modalType === 'INGRESO' ? 'Registrar ingreso' : 'Registrar retiro'}
				cancelText="Cancelar"
				okButtonProps={{ danger: modalType === 'RETIRO', loading: createMovement.isPending }}
				onOk={() => form.submit()}
				onCancel={closeModal}
				destroyOnClose
				centered
			>
				{modalType === 'RETIRO' && <Text type="secondary">Saldo disponible: <strong>{formatCOP(saldo)}</strong></Text>}
				<Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 12 }}>
					<Form.Item label="Monto" name="value" rules={[ ruleRequired ]}>
						<InputNumber thousandsSeparator placeholder="Monto en COP" />
					</Form.Item>
					<Form.Item label="Motivo" name="concept" rules={[ ruleRequired ]}>
						<Input.TextArea rows={2} maxLength={120} placeholder={modalType === 'INGRESO' ? 'Ej: aporte de capital' : 'Ej: retiro de utilidades'} />
					</Form.Item>
				</Form>
			</Modal>
		</DashboardShell>
	);
};

export default RouteCash;
