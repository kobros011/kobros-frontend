import { FC } from 'react';
import { Pill } from '@/UI/Components/Dashboard/ui';
import { RankBar } from '@/UI/Components/Dashboard/charts';
import { formatCOP, getInitials } from '@/UI/Components/Dashboard/format';
import { PaymentHistoryItemDto } from '@/infrastructure/dto/PaymentHistoryDto';
import { QuotaPayInline } from './QuotaPayInline';
import { formatDate, getDelayText, getStatusView } from './statusMeta';

/** Tarjeta de una cuota: estado, fecha límite, montos, quién recaudó y (si aplica) el abono inline. */
export const QuotaCardItem: FC<{ item: PaymentHistoryItemDto }> = ({ item }) => {
	const view = getStatusView(item);
	const delay = getDelayText(item);
	const partial = item.applied > 0 && item.balance > 0;
	const coveredPercent = item.value > 0 ? Math.min(100, (item.applied / item.value) * 100) : 0;
	const toneColor = `var(--kb-${view.tone === 'neutral' ? 'muted' : view.tone})`;

	return (
		<article
			className={`kb-row kb-tone-${view.tone}`}
			aria-label={`Cuota ${item.quota_number}, ${view.label}`}
			style={{ borderLeft: `3px solid ${toneColor}`, display: 'flex', flexDirection: 'column', gap: 10 }}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
				<strong>Cuota {item.quota_number}</strong>
				<Pill tone={view.tone}>{view.icon} {view.label}</Pill>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
				<div>
					<div className="kb-section-sub">Fecha límite</div>
					<strong className="kb-mono">{formatDate(item.pay_date)}</strong>
					{delay && <div style={{ color: item.status === 'mora' ? 'var(--kb-danger)' : 'var(--kb-warn)', fontSize: 12 }}>{delay}</div>}
				</div>
				<div style={{ textAlign: 'right' }}>
					<div className="kb-section-sub">{partial ? 'Saldo restante' : 'Valor cuota'}</div>
					<strong className="kb-mono" style={{ fontSize: 16 }}>{formatCOP(partial ? item.balance : item.value)}</strong>
				</div>
			</div>

			{partial && (
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
						<span className="kb-mono" style={{ color: 'var(--kb-ok)' }}>Abonado {formatCOP(item.applied)}</span>
						<span className="kb-mono" style={{ color: 'var(--kb-muted)' }}>de {formatCOP(item.value)}</span>
					</div>
					<RankBar percent={coveredPercent} tone="warn" />
				</div>
			)}

			{item.status === 'pagado' && (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12 }}>
					<span className="kb-mono" style={{ color: 'var(--kb-ok)' }}>
						Pagó {formatCOP(item.applied)} · {formatDate(item.payment_date)}
						{item.excess > 0 && <> · +{formatCOP(item.excess)} a favor</>}
					</span>
					{item.collected_by_name && (
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--kb-muted)' }}>
							<span className="kb-avatar kb-tone-neutral" aria-hidden>{getInitials(item.collected_by_name)}</span>
							{item.collected_by_name}
						</span>
					)}
				</div>
			)}

			{!item.can_pay && item.status === 'pendiente' && <span className="kb-section-sub">Aún no vence</span>}
			<QuotaPayInline item={item} />
		</article>
	);
};
