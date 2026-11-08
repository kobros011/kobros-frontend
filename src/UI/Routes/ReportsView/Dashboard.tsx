import { FC } from 'react';
import { DashboardParams } from '@/infrastructure/dto/DashboardDto';
import { CurrencyBlocks } from '@/UI/Components/CurrencyTabs';
import { Alert, Spin } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { getDashboardSummary } from '@/infrastructure/querys/Report';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { DashboardFilters } from '@/UI/Components/Dashboard/DashboardFilters';
import { useDashboardFilters } from '@/UI/Components/Dashboard/useDashboardFilters';
import { ReportsLayout } from './ReportsLayout';
import { KpiGrid } from './Resumen/KpiGrid';
import { CollectionTrendCard } from './Resumen/CollectionTrendCard';
import { PortfolioCompositionCard } from './Resumen/PortfolioCompositionCard';
import { RouteBreakdownCard } from './Resumen/RouteBreakdownCard';
import { CollectorRankingCard } from './Resumen/CollectorRankingCard';
import { CriticalLoansCard } from './Resumen/CriticalLoansCard';

/** Un bloque del resumen: todas las cifras de una sola moneda (la del `CurrencyProvider` que lo envuelve). */
const ResumenBlock: FC<{ params: DashboardParams }> = ({ params }) => {
	const { summary, isLoading, isError } = getDashboardSummary(params);

	if (isError) return <Alert type="error" showIcon message="No se pudo cargar el resumen. Intenta actualizar los datos." />;
	if (isLoading || !summary) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

	const { kpis } = summary;

	return (
		<>
			<KpiGrid kpis={kpis} />
			<div className="kb-grid-chart">
				<CollectionTrendCard data={summary.daily} />
				<PortfolioCompositionCard composition={summary.composition} criticalDays={summary.critical_days} />
			</div>
			<div className="kb-grid-2">
				<RouteBreakdownCard rows={summary.by_route} />
				<CollectorRankingCard rows={summary.by_collector} averageGoal={summary.average_goal} />
			</div>
			<CriticalLoansCard params={params} criticalDays={summary.critical_days} criticalClients={kpis.critical_clients} />
		</>
	);
};

/** Resumen operativo: KPIs, cobro diario, composición, rutas, recaudadores y casos críticos; un bloque por moneda. */
const Dashboard: FC = () => {
	const filters = useDashboardFilters();
	const { currencies } = filters;

	return (
		<ReportsLayout>
			<DashboardShell>
				<DashboardFilters
					title="Consolidado Operativo de Cobranza"
					subtitle="Cartera, recaudo y riesgo de mora de la operación"
					icon={<BarChartOutlined />}
					filters={filters}
					badge={`${filters.availableRoutes.length} ${filters.availableRoutes.length === 1 ? 'ruta activa' : 'rutas activas'}`}
				/>
				{currencies.length === 0 ? (
					<ResumenBlock params={filters.params} />
				) : (
					<CurrencyBlocks currencies={currencies}>
						{code => <ResumenBlock params={{ ...filters.params, currency: code }} />}
					</CurrencyBlocks>
				)}
			</DashboardShell>
		</ReportsLayout>
	);
};

export default Dashboard;
