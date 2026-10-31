import { Button, Card, Col, DatePicker, InputNumber, Modal, Row, Spin, Statistic, Tag, Typography, notification } from 'antd';
import { FC, useEffect, useState } from 'react';
import { SelectRoute } from '@components/Fields/SelectRoute';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { getListLiquidations, useCreateLiquidation } from '@/infrastructure/querys/Liquidation';
import { getListCollection } from '@/infrastructure/querys/Collection';
import dayjs, { Dayjs } from 'dayjs';
import { AxiosError } from 'axios';
import { PaymentStatus, TypeUser } from '@/constants/types';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { PendingConfirmations } from './PendingConfirmations';
import useUserStore from '@/infrastructure/context/User/UserDataStore';

const { Title, Text } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const LiquidationsView: FC = () => {
	const { routes } = useRoutes();
	const [routeId, setRouteId] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (routes?.length === 1) setRouteId(routes[0].id);
	}, [routes]);
	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
	const [todayGoal, setTodayGoal] = useState<number | null>(null);
	const [baseDelivered, setBaseDelivered] = useState<number | null>(null);
	const [newLoans, setNewLoans] = useState<number | null>(0);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	const { typeUser } = useUserStore(state => state.user);
	const role = normalizeTypeUser(typeUser) ?? TypeUser.collector;
	const isAdmin = [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);

	const dateStr = selectedDate.format('YYYY-MM-DD');
	const { collection, isLoading: isLoadingCollection } = getListCollection(routeId, dateStr);
	const { liquidations } = getListLiquidations();
	const { mutate: createLiquidation, isPending: isCreating } = useCreateLiquidation();

	const totalCollected = collection
		.filter(item => item.status === PaymentStatus.paid)
		.reduce((sum, item) => sum + (item.applied ?? 0), 0);

	const pendingCount = collection.filter(item => item.status !== PaymentStatus.paid).length;

	const existingLiquidation = liquidations.find(
		l => l.routeId === routeId && l.date?.startsWith(dateStr),
	);

	const pendingConfirmations = liquidations.filter(l => !l.adminConfirmedAt && l.active);

	const handleCloseCaja = () => {
		if (!routeId || todayGoal === null || baseDelivered === null) return;
		createLiquidation(
			{
				date: dateStr,
				today_collection_goal: todayGoal,
				value_base_delivered: baseDelivered,
				value_new_loans: newLoans ?? 0,
				route_id: routeId,
			},
			{
				onSuccess: () => {
					notification.success({ message: 'Caja cerrada exitosamente' });
					setConfirmModalOpen(false);
				},
				onError: (err: unknown) => {
					const detail = err instanceof AxiosError
						? (err.response?.data as { detail?: string } | undefined)?.detail
						: undefined;
					notification.error({ message: detail ?? 'Error al cerrar caja' });
					setConfirmModalOpen(false);
				},
			},
		);
	};

	return (
		<div style={{ padding: '16px 0', maxWidth: 700, margin: '0 auto' }}>
			<Title level={4} style={{ marginBottom: 16 }}>Liquidación / Cierre de caja</Title>

			<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12}>
					<SelectRoute
						placeholder="Seleccionar ruta"
						value={routeId}
						onChange={(val) => setRouteId(val )}
						style={{ width: '100%' }}
					/>
				</Col>
				<Col xs={24} sm={12}>
					<DatePicker
						value={selectedDate}
						onChange={(date) => date && setSelectedDate(date)}
						format="DD/MM/YYYY"
						style={{ width: '100%' }}
						allowClear={false}
					/>
				</Col>
			</Row>

			{routeId && (
				<>
					{isLoadingCollection ? (
						<div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
					) : (
						<>
							<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
								<Col xs={8}>
									<Card size="small" style={{ textAlign: 'center' }}>
										<Statistic title="Cobrado hoy" value={totalCollected} formatter={(v) => formatMoney(Number(v))} valueStyle={{ fontSize: 13, color: '#52c41a' }} />
									</Card>
								</Col>
								<Col xs={8}>
									<Card size="small" style={{ textAlign: 'center' }}>
										<Statistic title="Pendientes" value={pendingCount} valueStyle={{ fontSize: 13, color: pendingCount > 0 ? '#faad14' : '#52c41a' }} />
									</Card>
								</Col>
								<Col xs={8}>
									<Card size="small" style={{ textAlign: 'center' }}>
										<Statistic title="Estado" value={existingLiquidation ? (existingLiquidation.adminConfirmedAt ? 'Confirmada' : 'Pendiente') : 'Sin cerrar'} valueStyle={{ fontSize: 13 }} />
									</Card>
								</Col>
							</Row>

							{existingLiquidation ? (
								<Card style={{ marginBottom: 16 }}>
									<Title level={5}>Resumen del cierre</Title>
									<Row gutter={[16, 8]}>
										<Col xs={12}><Text type="secondary">Meta del día:</Text><div><Text strong>{formatMoney(existingLiquidation.todayCollectionGoal)}</Text></div></Col>
										<Col xs={12}><Text type="secondary">Base entregada:</Text><div><Text strong>{formatMoney(existingLiquidation.valueBaseDelivered)}</Text></div></Col>
										<Col xs={12}><Text type="secondary">Total cobrado:</Text><div><Text strong style={{ color: '#52c41a' }}>{formatMoney(existingLiquidation.totalValueCharged)}</Text></div></Col>
										<Col xs={12}><Text type="secondary">Total gastos:</Text><div><Text strong style={{ color: '#ff4d4f' }}>{formatMoney(existingLiquidation.totalValueExpenses)}</Text></div></Col>
										<Col xs={12}><Text type="secondary">Créditos nuevos:</Text><div><Text strong>{formatMoney(existingLiquidation.valueNewLoans)}</Text></div></Col>
										<Col xs={12}>
											<Text type="secondary">Estado:</Text>
											<div>
												<Tag color={existingLiquidation.adminConfirmedAt ? 'green' : 'orange'}>
													{existingLiquidation.adminConfirmedAt ? 'Confirmada por admin' : 'Pendiente de confirmación'}
												</Tag>
											</div>
										</Col>
									</Row>
								</Card>
							) : (
								<Card style={{ marginBottom: 16 }}>
									<Title level={5} style={{ marginBottom: 12 }}>Datos para el cierre</Title>
									<Row gutter={[12, 12]}>
										<Col xs={24} sm={12}>
											<Text type="secondary">Meta de cobro del día</Text>
											<InputNumber
												value={todayGoal}
												onChange={setTodayGoal}
												style={{ width: '100%', marginTop: 4 }}
												min={0}
												formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={(v) => Number(v?.replace(/\$\s?|(,*)/g, '') ?? 0) as unknown as 0}
											/>
										</Col>
										<Col xs={24} sm={12}>
											<Text type="secondary">Base entregada al cobrador</Text>
											<InputNumber
												value={baseDelivered}
												onChange={setBaseDelivered}
												style={{ width: '100%', marginTop: 4 }}
												min={0}
												formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={(v) => Number(v?.replace(/\$\s?|(,*)/g, '') ?? 0) as unknown as 0}
											/>
										</Col>
										<Col xs={24} sm={12}>
											<Text type="secondary">Valor créditos nuevos del día</Text>
											<InputNumber
												value={newLoans}
												onChange={setNewLoans}
												style={{ width: '100%', marginTop: 4 }}
												min={0}
												formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={(v) => Number(v?.replace(/\$\s?|(,*)/g, '') ?? 0) as unknown as 0}
											/>
										</Col>
									</Row>
									<Button
										type="primary"
										block
										size="large"
										style={{ marginTop: 16, height: 52, fontWeight: 600 }}
										disabled={!routeId || todayGoal === null || baseDelivered === null}
										onClick={() => setConfirmModalOpen(true)}
									>
										CERRAR CAJA DEL DÍA
									</Button>
								</Card>
							)}
						</>
					)}
				</>
			)}

			{!routeId && (
				<Card style={{ textAlign: 'center', padding: 24 }}>
					<Text type="secondary">Selecciona una ruta para ver o cerrar la caja del día</Text>
				</Card>
			)}

			{isAdmin && pendingConfirmations.length > 0 && (
				<PendingConfirmations liquidations={pendingConfirmations} />
			)}

			<Modal
				title="Confirmar cierre de caja"
				open={confirmModalOpen}
				onOk={handleCloseCaja}
				onCancel={() => setConfirmModalOpen(false)}
				okText="Confirmar cierre"
				cancelText="Cancelar"
				confirmLoading={isCreating}
			>
				<p>Se calcularán automáticamente el total cobrado y los gastos del día para la ruta y fecha seleccionadas.</p>
				<p><strong>Meta:</strong> {todayGoal !== null ? formatMoney(todayGoal) : '-'}</p>
				<p><strong>Base entregada:</strong> {baseDelivered !== null ? formatMoney(baseDelivered) : '-'}</p>
				<p><strong>Créditos nuevos:</strong> {formatMoney(newLoans ?? 0)}</p>
			</Modal>
		</div>
	);
};

export default LiquidationsView;
