import { FC } from 'react';
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

/** Resumen operativo: KPIs, cobro diario, composición, rutas, recaudadores y casos críticos. */
const Dashboard: FC = () => {
	const filters = useDashboardFilters();
	const { summary, isLoading, isError } = getDashboardSummary(filters.params);

	if (isError) {
		return <ReportsLayout><Alert type="error" showIcon message="No se pudo cargar el resumen. Intenta actualizar los datos." /></ReportsLayout>;
	}
	if (isLoading || !summary) {
		return <ReportsLayout><div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div></ReportsLayout>;
	}

	const { kpis } = summary;

	return (
		<ReportsLayout>
			<DashboardShell>
				<DashboardFilters
					title="Consolidado Operativo de Cobranza"
					subtitle="Cartera, recaudo y riesgo de mora de la operación (COP)"
					icon={<BarChartOutlined />}
					filters={filters}
					badge={`${kpis.routes_total} ${kpis.routes_total === 1 ? 'ruta activa' : 'rutas activas'}`}
				/>
				<KpiGrid kpis={kpis} />
				<div className="kb-grid-chart">
					<CollectionTrendCard data={summary.daily} />
					<PortfolioCompositionCard composition={summary.composition} criticalDays={summary.critical_days} />
				</div>
				<div className="kb-grid-2">
					<RouteBreakdownCard rows={summary.by_route} />
					<CollectorRankingCard rows={summary.by_collector} averageGoal={summary.average_goal} />
				</div>
				<CriticalLoansCard params={filters.params} criticalDays={summary.critical_days} criticalClients={kpis.critical_clients} />
			</DashboardShell>
		</ReportsLayout>
	);
};

export default Dashboard;
