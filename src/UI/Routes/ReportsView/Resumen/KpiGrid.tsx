import { FC } from 'react';

import { EnvironmentOutlined, UsergroupAddOutlined, WalletOutlined, WarningOutlined } from '@ant-design/icons';

import { KpiCard, Pill } from '@/UI/Components/Dashboard/ui';

import { RadialGauge, toneByCompliance } from '@/UI/Components/Dashboard/charts';

import { formatPercent } from '@/UI/Components/Dashboard/format';
import { DashboardKpisDto } from '@/infrastructure/dto/DashboardDto';
import { useMoney } from '@/infrastructure/hooks/useMoney';


/** Las 5 tarjetas KPI del Resumen; todo el cálculo viene del servidor, aquí solo se formatea. */
export const KpiGrid: FC<{ kpis: DashboardKpisDto }> = ({ kpis }) => {
	const money = useMoney();
	const routesPercent = kpis.routes_total ? Math.round((kpis.routes_with_loans / kpis.routes_total) * 100) : 0;

	return (
		<div className="kb-grid-kpi">
			<KpiCard
				label="Cartera activa total"
				subtitle="Total por cobrar (capital + intereses)"
				icon={<WalletOutlined />}
				value={money(kpis.portfolio_total)}
				pill={<><Pill tone="ok">{kpis.portfolio_loans} créditos</Pill> vigentes</>}
				footer={(
					<div style={{ display: 'grid', gap: 2 }}>
						<span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capital</span><strong className="kb-mono">{money(kpis.portfolio_capital)}</strong></span>
						<span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Intereses</span><strong className="kb-mono">{money(kpis.portfolio_interest)}</strong></span>
					</div>
				)}
			/>
			<KpiCard
				label="Cartera en mora"
				subtitle="Saldo vencido acumulado"
				icon={<WarningOutlined />}
				tone="danger"
				valueTone="danger"
				value={money(kpis.delinquency_total)}
				pill={<><Pill tone="danger">{formatPercent(kpis.delinquency_rate)}</Pill> de la cartera total</>}
			/>
			<KpiCard
				label="Base de clientes"
				subtitle="Titulares con crédito"
				icon={<UsergroupAddOutlined />}
				tone="neutral"
				value={kpis.clients_active}
				unit="Activos"
				pill={<>{kpis.clients_inactive} {kpis.clients_inactive === 1 ? 'inactivo' : 'inactivos'} ·<strong className="kb-mono">{formatPercent(kpis.active_rate)}</strong> tasa</>}
			/>
			<KpiCard
				label="Efectividad de cobro"
				subtitle="Recaudado sobre colocado"
				value={formatPercent(kpis.effectiveness)}
				tone="primary"
				aside={<RadialGauge percent={kpis.effectiveness} tone={toneByCompliance(kpis.effectiveness)} />}
				footer={<span className="kb-mono">{money.compact(kpis.total_paid)} / {money.compact(kpis.total_lent)}</span>}
			/>
			<KpiCard
				label="Rutas operativas"
				subtitle="Despliegue territorial"
				icon={<EnvironmentOutlined />}
				value={`${kpis.routes_with_loans} / ${kpis.routes_total}`}
				pill={<Pill tone="ok">{routesPercent}% en ruta</Pill>}
				footer={`${kpis.collectors_in_field} ${kpis.collectors_in_field === 1 ? 'recaudador' : 'recaudadores'} en campo`}
			/>
		</div>
	);
};
