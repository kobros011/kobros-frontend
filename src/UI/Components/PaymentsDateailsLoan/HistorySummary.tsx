import { FC } from 'react';
import { Pill } from '@/UI/Components/Dashboard/ui';
import { RankBar } from '@/UI/Components/Dashboard/charts';
import { formatCOP, formatPercent } from '@/UI/Components/Dashboard/format';
import { PaymentHistorySummaryDto } from '@/infrastructure/dto/PaymentHistoryDto';

/** Chips por estado y barra de avance "Pagado $X de $Y". */
export const HistorySummary: FC<{ summary: PaymentHistorySummaryDto }> = ({ summary }) => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
		<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
			<Pill tone="neutral">{summary.total_quotas} cuotas</Pill>
			<Pill tone="ok">{summary.paid} {summary.paid === 1 ? 'pagada' : 'pagadas'}</Pill>
			<Pill tone="danger">{summary.overdue} en mora</Pill>
			<Pill tone="primary">{summary.pending} {summary.pending === 1 ? 'pendiente' : 'pendientes'}</Pill>
		</div>
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, marginBottom: 4 }}>
				<span className="kb-mono">
					Pagado <strong style={{ color: 'var(--kb-text)' }}>{formatCOP(summary.total_paid)}</strong> de {formatCOP(summary.total_due)}
				</span>
				<strong className="kb-mono" style={{ color: 'var(--kb-primary)' }}>{formatPercent(summary.paid_percent)} pagado</strong>
			</div>
			<RankBar percent={summary.paid_percent} tone="primary" />
		</div>
	</div>
);
