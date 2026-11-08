import { FC, useMemo, useState } from 'react';
import { Alert, Radio, Skeleton, theme } from 'antd';
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

	return (
		<DashboardShell>
			<section className="pr-card" aria-label="Prioridad en la ruta" style={{ marginBottom: 12 }}>
				<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
					<strong>Prioridad en {mine.routeName}</strong>
					<span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>Hoy #{current} de {pluralClients(total)}</span>
				</header>

				<Radio.Group value={method} onChange={event => pick(event.target.value as Method)} disabled={disabled} style={{ display: 'grid', gap: 6 }}>
					<Radio value="keep">Mantener la posición actual (#{current})</Radio>
					<Radio value="position">Posición específica</Radio>
					<Radio value="end">Al final de la ruta (#{total})</Radio>
				</Radio.Group>

				{method === 'position' && (
					<PriorityStepper value={target} max={total} disabled={disabled} onChange={next => onChange?.(clampPosition(next, total))} label="Nueva posición" />
				)}

				{method !== 'keep' && (
					<>
						<div className="pr-label" style={{ margin: 0 }}>Contexto de la ruta</div>
						<div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: 6, fontSize: 11 }}>
							<span className="pr-neighbors kb-mono" style={{ justifyContent: 'center' }}>{before ? `#${before.newOrder} ${before.name}` : 'Inicio'}</span>
							<span aria-hidden>›</span>
							<span className="pr-neighbors kb-mono" style={{ justifyContent: 'center', borderColor: token.colorPrimary, color: token.colorPrimary, fontWeight: 700 }}>#{target} {mine.fullName} (nuevo)</span>
							<span aria-hidden>›</span>
							<span className="pr-neighbors kb-mono" style={{ justifyContent: 'center' }}>{after ? `#${after.newOrder} ${after.name}` : 'Final'}</span>
						</div>
						{shifted > 0 && <Alert type="warning" showIcon style={{ fontSize: 12 }} message={`${pluralClients(shifted)} se ${shifted === 1 ? 'desplazará' : 'desplazarán'} un lugar.`} />}
					</>
				)}
			</section>
		</DashboardShell>
	);
};
