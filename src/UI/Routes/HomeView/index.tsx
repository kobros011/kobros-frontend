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
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import { formatMoney, getRouteCurrency } from '@/infrastructure/utils/money';

const { Title } = Typography;

/** Suma por moneda de la ruta de cada fila: nunca se suman monedas distintas. */
const sumByCurrency = <T extends object>(rows: T[], routeOf: (row: T) => string | undefined, valueOf: (row: T) => number): Record<string, number> => {
	const totals: Record<string, number> = {};
	rows.forEach(row => {
		const currency = getRouteCurrency(routeOf(row)) ?? '';
		totals[currency] = (totals[currency] ?? 0) + valueOf(row);
	});
	return totals;
};

/** Un valor por línea y por moneda ("$1.200 COP" / "US$30 USD"); sin datos, el cero de la moneda principal. */
const CurrencyLines: FC<{ totals: Record<string, number>; primary?: string }> = ({ totals, primary }) => {
	const entries = Object.entries(totals);
	if (entries.length === 0) return <>{formatMoney(0, primary)}</>;
	return <>{entries.map(([currency, total]) => <div key={currency}>{formatMoney(total, currency || undefined)}</div>)}</>;
};

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

	const primary = useAppSettingsStore(state => state.currencies[0]);
	const totalPortfolio = sumByCurrency(portfolio, i => i.route_id, i => i.balance);
	const totalDelinquency = sumByCurrency(delinquency, i => i.route_id, i => i.balance);
	const paidToday = collection.filter(p => p.status === PaymentStatus.paid);
	const collectedToday = sumByCurrency(paidToday, p => p.routeId, p => p.applied ?? 0);
	const pendingToday = collection.filter(p => p.status !== PaymentStatus.paid).length;
	const expectedToday = sumByCurrency(collection, p => p.routeId, p => p.value);
	// La efectividad es un cociente: se calcula dentro de cada moneda.
	const effectiveness = Object.entries(expectedToday).map(([currency, expected]) => ({
		currency,
		percent: expected > 0 ? Math.min(100, ((collectedToday[currency] ?? 0) / expected) * 100) : 0,
	}));
	const lowestEffectiveness = effectiveness.length ? Math.min(...effectiveness.map(e => e.percent)) : 0;

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
										value={0}
										formatter={() => <CurrencyLines totals={totalPortfolio} primary={primary} />}
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
										value={0}
										formatter={() => <CurrencyLines totals={totalDelinquency} primary={primary} />}
										valueStyle={{ color: Object.values(totalDelinquency).some(v => v > 0) ? '#ff4d4f' : '#52c41a', fontSize: 18 }}
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
								value={0}
								formatter={() => <CurrencyLines totals={collectedToday} primary={primary} />}
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
								value={0}
								formatter={() => (effectiveness.length > 1
									? <>{effectiveness.map(e => <div key={e.currency}>{e.percent.toFixed(1)}% {e.currency}</div>)}</>
									: <>{(effectiveness[0]?.percent ?? 0).toFixed(1)}%</>)}
								valueStyle={{
									color: lowestEffectiveness >= 80 ? '#52c41a' : lowestEffectiveness >= 50 ? '#faad14' : '#ff4d4f',
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
