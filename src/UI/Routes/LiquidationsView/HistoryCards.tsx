import { FC } from 'react';
import { Button } from 'antd';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { Pill } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { LiquidationListItemDto } from '@/infrastructure/dto/LiquidationDto';
import { formatDay, getDifferenceView, getStatusView, signedCOP } from './statusMeta';

const Figure: FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
	<div className="lq-figure">
		<span>{label}</span>
		<strong className="kb-mono" style={color ? { color } : undefined}>{value}</strong>
	</div>
);

/** Vista en tarjetas (por defecto en móvil): fecha, ruta/cobrador, estado, 4 cifras y diferencia. */
export const HistoryCards: FC<{ items: LiquidationListItemDto[]; onOpen: (id: string) => void }> = ({ items, onOpen }) => (
	<div className="lq-cards">
		{items.map(item => {
			const status = getStatusView(item.status, item.outdated);
			const diff = getDifferenceView(item.difference ?? 0);
			return (
				<article key={item.id} className="kb-row" aria-label={`Cierre del ${formatDay(item.date)}, ${item.route_name}`}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
						<div>
							<strong className="kb-mono" style={{ fontSize: 16 }}>{formatDay(item.date)}</strong>
							<div className="kb-section-sub">{item.route_name} · {(item.collector_name ? shortName(item.collector_name) : 'Consolidado')}</div>
						</div>
						<Pill tone={status.tone}>{status.icon} {status.label}</Pill>
					</div>
					<div className="lq-figures">
						<Figure label="Recaudo" value={formatCOP(item.total_value_charged)} />
						<Figure label="Gastos" value={signedCOP(-item.total_value_expenses)} color="var(--kb-warn)" />
						<Figure label={`Créditos nuevos (${item.new_loans_count})`} value={signedCOP(-item.value_new_loans)} color="var(--kb-info)" />
						<Figure label="Efectivo esperado" value={formatCOP(item.expected_cash ?? 0)} />
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
						<span className="kb-section-sub">Entregado <strong className="kb-mono" style={{ color: 'var(--kb-text)' }}>{formatCOP(item.cash_delivered ?? 0)}</strong></span>
						<Pill tone={diff.tone}>{diff.icon} {diff.text}</Pill>
					</div>
					<Button size="small" block style={{ marginTop: 10 }} onClick={() => onOpen(item.id)}>Ver detalle</Button>
				</article>
			);
		})}
	</div>
);
