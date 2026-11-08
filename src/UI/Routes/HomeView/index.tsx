import { Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import { TypeUser } from '@/constants/types';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getPortfolioReport, getDelinquencyReport } from '@/infrastructure/querys/Report';
import { getListCollection } from '@/infrastructure/querys/Collection';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { SelectRoute } from '@/UI/Components/Fields/SelectRoute';
import dayjs from 'dayjs';
import { PaymentStatus } from '@/constants/types';
import { Link } from 'react-router-dom';
import routePaths from '@/constants/routePaths';

const { Title } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const HomeView: FC = () => {
	const { typeUser } = useUserStore(state => state.user);
	const isReportUser = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.partner].includes(typeUser);

	const { routes } = useRoutes();
	const [routeId, setRouteId] = useState<string | undefined>(undefined);
	const today = dayjs().format('YYYY-MM-DD');

	useEffect(() => {
		if (routes?.length === 1 && !routeId) {
			setRouteId(routes[0].id);
		}
	}, [routes, routeId]);

	const { items: portfolio, isLoading: loadingPortfolio } = getPortfolioReport();
	const { items: delinquency, isLoading: loadingDelinquency } = getDelinquencyReport();
	const { collection, isLoading: loadingCollection } = getListCollection(routeId, today);

	const totalPortfolio = portfolio.reduce((s, i) => s + i.balance, 0);
	const totalDelinquency = delinquency.reduce((s, i) => s + i.balance, 0);
	const collectedToday = collection
		.filter(p => p.status === PaymentStatus.paid)
		.reduce((s, p) => s + (p.applied ?? 0), 0);
	const pendingToday = collection.filter(p => p.status !== PaymentStatus.paid).length;
	const expectedToday = collection.reduce((s, p) => s + p.value, 0);
	const effectiveness =
		expectedToday > 0 ? Math.min(100, (collectedToday / expectedToday) * 100) : 0;

	const loading = loadingPortfolio || loadingDelinquency || loadingCollection;

	return (
		<div style={{ padding: '8px 0' }}>
			<Title level={4} style={{ marginBottom: 16 }}>Inicio</Title>

			<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<SelectRoute
						placeholder="Ruta para KPIs del día"
						value={routeId}
						onChange={val => setRouteId(val )}
						style={{ width: '100%' }}
					/>
				</Col>
			</Row>

			{loading ? (
				<div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
			) : (
				<Row gutter={[16, 16]}>
					{isReportUser && (
						<>
							<Col xs={24} sm={12} lg={6}>
								<Card>
									<Statistic
										title="Cartera total activa"
										value={totalPortfolio}
										formatter={v => formatMoney(Number(v))}
										valueStyle={{ color: '#1677ff', fontSize: 18 }}
									/>
									<Link to={`/${routePaths.DEFAULT_HOME}/${routePaths.PAYMENTS}`} style={{ fontSize: 12 }}>
										Ver cartera →
									</Link>
								</Card>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<Card>
									<Statistic
										title="Total en mora"
										value={totalDelinquency}
										formatter={v => formatMoney(Number(v))}
										valueStyle={{ color: totalDelinquency > 0 ? '#ff4d4f' : '#52c41a', fontSize: 18 }}
									/>
									<Link to={`/${routePaths.DEFAULT_HOME}/${routePaths.PAYMENTS_DELINQUENCY}`} style={{ fontSize: 12 }}>
										Ver mora →
									</Link>
								</Card>
							</Col>
						</>
					)}
					<Col xs={24} sm={12} lg={6}>
						<Card>
							<Statistic
								title="Cobrado hoy"
								value={collectedToday}
								formatter={v => formatMoney(Number(v))}
								valueStyle={{ color: '#52c41a', fontSize: 18 }}
							/>
							{routeId && (
								<Link to={`/${routePaths.DEFAULT_HOME}/${routePaths.COLLECTION_TODAY}`} style={{ fontSize: 12 }}>
									Ver cobro →
								</Link>
							)}
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card>
							<Statistic
								title="Pendientes hoy"
								value={pendingToday}
								valueStyle={{ color: pendingToday > 0 ? '#faad14' : '#52c41a', fontSize: 18 }}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={12} lg={6}>
						<Card>
							<Statistic
								title="% Efectividad"
								value={effectiveness}
								precision={1}
								suffix="%"
								valueStyle={{
									color: effectiveness >= 80 ? '#52c41a' : effectiveness >= 50 ? '#faad14' : '#ff4d4f',
									fontSize: 18,
								}}
							/>
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default HomeView;
