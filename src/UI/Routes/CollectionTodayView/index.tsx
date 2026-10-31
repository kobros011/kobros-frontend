import { Card, Col, DatePicker, Empty, Row, Spin, Statistic, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { SelectRoute } from '@components/Fields/SelectRoute';
import { getListCollection } from '@/infrastructure/querys/Collection';
import { ClientCard } from './ClientCard';
import { PaymentStatus } from '@/constants/types';
import dayjs, { Dayjs } from 'dayjs';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';

const { Title } = Typography;

const CollectionTodayView: FC = () => {
	const [routeId, setRouteId] = useState<string | undefined>(undefined);
	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

	const { routes } = useRoutes();

	useEffect(() => {
		if (routes.length === 1 && !routeId) {
			setRouteId(routes[0].id);
		}
	}, [routes]);

	const dateStr = selectedDate.format('YYYY-MM-DD');
	const { collection, isLoading } = getListCollection(routeId, dateStr);

	const totalExpected = collection.reduce((sum, item) => sum + item.value, 0);
	const totalCollected = collection
		.filter(item => item.status === PaymentStatus.paid)
		.reduce((sum, item) => sum + (item.applied ?? 0), 0);
	const pending = collection.filter(item => item.status !== PaymentStatus.paid).length;

	const formatMoney = (val: number) =>
		new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

	return (
		<div style={{ padding: '16px 0', maxWidth: 600, margin: '0 auto' }}>
			<Title level={4} style={{ marginBottom: 16 }}>Cobro del día</Title>

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
				<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
					<Col xs={8}>
						<Card size="small" style={{ textAlign: 'center' }}>
							<Statistic
								title="Esperado"
								value={totalExpected}
								formatter={(val) => formatMoney(Number(val))}
								valueStyle={{ fontSize: 14 }}
							/>
						</Card>
					</Col>
					<Col xs={8}>
						<Card size="small" style={{ textAlign: 'center' }}>
							<Statistic
								title="Cobrado"
								value={totalCollected}
								formatter={(val) => formatMoney(Number(val))}
								valueStyle={{ fontSize: 14, color: '#52c41a' }}
							/>
						</Card>
					</Col>
					<Col xs={8}>
						<Card size="small" style={{ textAlign: 'center' }}>
							<Statistic
								title="Pendientes"
								value={pending}
								valueStyle={{ fontSize: 14, color: pending > 0 ? '#faad14' : '#52c41a' }}
							/>
						</Card>
					</Col>
				</Row>
			)}

			{isLoading && (
				<div style={{ textAlign: 'center', padding: 40 }}>
					<Spin size="large" />
				</div>
			)}

			{!isLoading && routeId && collection.length === 0 && (
				<Empty description="No hay cobros pendientes para esta fecha" />
			)}

			{!isLoading && !routeId && (
				<Empty description="Selecciona una ruta para ver los cobros del día" />
			)}

			{!isLoading && collection.map((item) => (
				<ClientCard key={item.id} collection={item} />
			))}
		</div>
	);
};

export default CollectionTodayView;
