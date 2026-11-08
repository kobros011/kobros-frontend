import { FC } from 'react';

import { Button } from 'antd';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';

import { Pill } from '@/UI/Components/Dashboard/ui';

import { LiquidationListItemDto } from '@/infrastructure/dto/LiquidationDto';

import { LiquidationActions } from './LiquidationActions';

import { getDifferenceView } from './statusMeta';
import { useRouteMoney } from '@/infrastructure/hooks/useMoney';

dayjs.extend(relativeTime);

const Figure: FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
	<div className="lq-figure">
		<span>{label}</span>
		<strong className="kb-mono" style={color ? { color } : undefined}>{value}</strong>
	</div>
);

/** Tarjeta de un cierre por confirmar: cifras, diferencia, nota del cobrador y acciones (confirmar o reabrir si está desactualizado). */
export const PendingCard: FC<{ item: LiquidationListItemDto; onOpen: (id: string) => void }> = ({ item, onOpen }) => {
	const routeMoney = useRouteMoney();
	const money = (value: number) => routeMoney(value, item.route_id);
	const diff = getDifferenceView(item.difference ?? 0, money);
	const sent = dayjs(item.created_at);

	return (
		<article className="kb-row" aria-label={`Cierre pendiente de ${item.route_name}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
				<div>
					<strong>{item.route_name}</strong> <span className="kb-section-sub">{(item.collector_name ? shortName(item.collector_name) : 'Consolidado')}</span>
					<div className="kb-section-sub kb-mono">Enviado: {sent.format('DD/MM/YYYY hh:mm A')} · {sent.locale('es').fromNow()}</div>
				</div>
				{item.outdated
					? <Pill tone="warn"><ExclamationCircleOutlined /> Cierre desactualizado</Pill>
					: <Pill tone={diff.tone}>{diff.icon} {diff.text}</Pill>}
			</div>

			<div className="lq-figures" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
				<Figure label="Recaudo" value={money(item.total_value_charged)} />
				<Figure label="Gastos" value={money(-item.total_value_expenses)} color="var(--kb-warn)" />
				<Figure label={`Créditos nuevos (${item.new_loans_count})`} value={money(-item.value_new_loans)} color="var(--kb-info)" />
				<Figure label="Esperado" value={money(item.expected_cash ?? 0)} />
			</div>

			{item.outdated ? (
				<div className="lq-alert" role="alert">
					<strong><ExclamationCircleOutlined /> Hay {money(item.outdated_amount)} cobrados después del envío del informe</strong>
					<div className="kb-section-sub">El cobrador registró {item.late_receipts} {item.late_receipts === 1 ? 'recibo adicional' : 'recibos adicionales'} luego de cerrar su caja.</div>
				</div>
			) : (
				<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
					<span className="kb-section-sub">Efectivo entregado por {item.collector_name ?? 'la ruta'}</span>
					<strong className="kb-mono" style={{ color: `var(--kb-${diff.tone === 'ok' ? 'ok' : diff.tone})` }}>{money(item.cash_delivered ?? 0)}</strong>
				</div>
			)}

			{item.note && (
				<div className="lq-note">
					<span className="kb-section-sub">Nota del cobrador</span>
					<em>“{item.note}”</em>
				</div>
			)}

			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 'auto' }}>
				<Button size="small" onClick={() => onOpen(item.id)}>{item.outdated ? 'Ver recibos nuevos' : 'Revisar recibos y gastos'}</Button>
				<LiquidationActions id={item.id} status={item.status} outdated={item.outdated} isAdmin />
			</div>
		</article>
	);
};
