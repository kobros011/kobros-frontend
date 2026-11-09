import { FC, useMemo, useState } from 'react';
import { Alert, Segmented, Skeleton, theme } from 'antd';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { getRouteClients } from '@/infrastructure/querys/ClientRoute';
import { PriorityStepper } from './PriorityStepper';
import { clampPosition, computeMove, pluralClients } from './moveLogic';
import './priority.css';

type Method = 'keep' | 'position' | 'end';

interface PrioritySelectorProps {
	clientId: string
	routeId?: string
	/** Control de `Form.Item`: nueva posición (`undefined` = mantener la actual). */
	value?: number
	onChange?: (value?: number) => void
	disabled?: boolean
}

/** Prioridad dentro del asistente de crédito: mantener, elegir una posición o dejarlo al final, con vista previa de vecinos. */
export const PrioritySelector: FC<PrioritySelectorProps> = ({ clientId, routeId, value, onChange, disabled }) => {
	const { token } = theme.useToken();
	const { routeClients, isLoading } = getRouteClients(routeId);
	const [method, setMethod] = useState<Method>('keep');

	const rows = useMemo(() => routeClients.map(item => ({ id: item.id, name: item.fullName, order: item.order ?? 0 })), [routeClients]);
	const mine = routeClients.find(item => item.clientId === clientId);
	const total = rows.length;
	const current = mine?.order ?? 0;

	const target = method === 'keep' ? current : method === 'end' ? total : clampPosition(value ?? current, total);
	const preview = useMemo(() => (mine ? computeMove(rows, [mine.id], 'position', target) : []), [rows, mine, target]);
	const placed = preview.findIndex(row => row.id === mine?.id);
	const before = placed > 0 ? preview[placed - 1] : undefined;
	const after = placed >= 0 ? preview[placed + 1] : undefined;
	const shifted = preview.filter(row => row.status === 'shifted').length;

	const pick = (next: Method) => {
		setMethod(next);
		onChange?.(next === 'keep' ? undefined : next === 'end' ? total : clampPosition(value ?? current, total));
	};

	if (!routeId) return <Alert type="info" showIcon message="Elige una ruta para ver la prioridad del cliente" />;
	if (isLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
	if (!mine) return <Alert type="warning" showIcon message="El cliente no tiene prioridad en esta ruta" />;

	const neighbor = (row?: { newOrder: number, name: string }, fallback = '') => (row ? `#${row.newOrder} ${row.name}` : fallback);

	return (
		<DashboardShell>
			<section className="pr-card" aria-label="Prioridad en la ruta" style={{ marginBottom: 12, gap: 8, padding: 10 }}>
				<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
					<strong style={{ fontSize: 12 }}>Prioridad en {mine.routeName}</strong>
					<span className="kb-mono" style={{ fontSize: 10, color: 'var(--kb-muted)' }}>Hoy #{current} de {pluralClients(total)}</span>
				</header>

				<Segmented
					size="small"
					block
					value={method}
					disabled={disabled}
					onChange={next => pick(next as Method)}
					options={[
						{ value: 'keep', label: `Mantener #${current}` },
						{ value: 'position', label: 'Posición' },
						{ value: 'end', label: `Al final #${total}` },
					]}
				/>

				{method === 'position' && (
					<PriorityStepper value={target} max={total} disabled={disabled} onChange={next => onChange?.(clampPosition(next, total))} label="Nueva posición" />
				)}

				{method !== 'keep' && (
					<div className="kb-mono" style={{ fontSize: 10, color: 'var(--kb-muted)', lineHeight: 1.5 }}>
						{neighbor(before, 'Inicio')} › <strong style={{ color: token.colorPrimary }}>#{target} nuevo</strong> › {neighbor(after, 'Final')}
						{shifted > 0 && <span> · {pluralClients(shifted)} se {shifted === 1 ? 'desplaza' : 'desplazan'} un lugar</span>}
					</div>
				)}
			</section>
		</DashboardShell>
	);
};
