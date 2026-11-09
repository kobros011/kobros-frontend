import { FC, useEffect, useState } from 'react';
import { Alert, Button, Select, Skeleton } from 'antd';
import { LockOutlined, PlusOutlined } from '@ant-design/icons';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { getRouteClients } from '@/infrastructure/querys/ClientRoute';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { PriorityBadge } from './PriorityChip';
import { PriorityStepper } from './PriorityStepper';
import { clampPosition } from './moveLogic';
import './priority.css';

export interface RouteAssignment {
	routeId: string
	/** Prioridad pedida en la ruta; `undefined` = al final. */
	order?: number
}

interface RouteRowProps {
	name: string
	assignment: RouteAssignment
	canRemove: boolean
	onOrder: (order?: number) => void
	onRemove: () => void
}

/** Una ruta del cliente nuevo: mismo bloque que "Rutas y prioridad asignadas" al editar (#n de m, orden y quitar). */
const RouteRow: FC<RouteRowProps> = ({ name, assignment, canRemove, onOrder, onRemove }) => {
	const { routeClients, isLoading } = getRouteClients(assignment.routeId);
	const total = routeClients.length + 1; // el cliente nuevo cuenta en la ruta
	const position = clampPosition(assignment.order ?? total, total);
	const setPosition = (next: number) => onOrder(next >= total ? undefined : next);

	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<div className="pr-row">
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<PriorityBadge order={position} />
					<div>
						<strong>{name}</strong>
						<div className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>#{position} de {total}</div>
					</div>
				</div>
				<Button size="small" danger icon={canRemove ? undefined : <LockOutlined />} disabled={!canRemove} title={canRemove ? undefined : 'Un cliente debe tener al menos una ruta'} onClick={onRemove}>
					Quitar
				</Button>
			</div>
			{isLoading ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : (
				<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
					<Button size="small" onClick={() => setPosition(1)} disabled={position === 1}>Inicio (#1)</Button>
					<PriorityStepper value={position} max={total} onChange={value => setPosition(clampPosition(value, total))} label={`Posición en ${name}`} />
					<Button size="small" onClick={() => onOrder(undefined)} disabled={assignment.order === undefined}>Final (#{total})</Button>
				</div>
			)}
		</div>
	);
};

interface ClientRoutesPickerProps {
	/** Control de `Form.Item`. */
	value?: RouteAssignment[]
	onChange?: (value: RouteAssignment[]) => void
}

/** Al crear un cliente: el mismo bloque "Rutas y prioridad asignadas" de la edición, pero para elegir sus rutas y su lugar en cada una. */
export const ClientRoutesPicker: FC<ClientRoutesPickerProps> = ({ value = [], onChange }) => {
	const { routes } = useRoutes();
	const [newRoute, setNewRoute] = useState<string>();
	const available = routes.filter(route => !value.some(item => item.routeId === route.id));
	const nameOf = (id: string) => routes.find(route => route.id === id)?.name ?? 'Ruta';

	// Con una sola ruta disponible ya viene marcada.
	useEffect(() => {
		if (routes.length === 1 && value.length === 0) onChange?.([{ routeId: routes[0].id }]);
	}, [routes, value.length, onChange]);

	const add = () => {
		if (!newRoute) return;
		onChange?.([...value, { routeId: newRoute }]);
		setNewRoute(undefined);
	};

	return (
		<DashboardShell>
			<section className="pr-card" aria-label="Rutas y prioridad asignadas">
				<header>
					<strong>Rutas y prioridad asignadas</strong> <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>({value.length} {value.length === 1 ? 'ruta activa' : 'rutas activas'})</span>
					<div className="pr-hint" style={{ marginTop: 2 }}>Un cliente puede estar en más de una ruta con prioridades independientes. Sin prioridad queda al final.</div>
				</header>

				<div style={{ display: 'grid', gap: 12 }}>
					{value.length === 0 && <Alert type="info" showIcon message="Elige al menos una ruta para el cliente" />}
					{value.map(item => (
						<RouteRow
							key={item.routeId}
							name={nameOf(item.routeId)}
							assignment={item}
							canRemove={value.length > 1}
							onOrder={order => onChange?.(value.map(entry => (entry.routeId === item.routeId ? { ...entry, order } : entry)))}
							onRemove={() => onChange?.(value.filter(entry => entry.routeId !== item.routeId))}
						/>
					))}
				</div>

				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
					<Select
						size="small" style={{ minWidth: 220 }} showSearch optionFilterProp="label" placeholder={value.length === 0 ? 'Elegir ruta…' : 'Asignar a otra ruta…'} aria-label="Ruta a agregar"
						value={newRoute} onChange={setNewRoute} disabled={available.length === 0}
						options={available.map(route => ({ value: route.id, label: route.name }))}
					/>
					<Button size="small" type="primary" icon={<PlusOutlined />} disabled={!newRoute} onClick={add}>
						Asignar ruta
					</Button>
				</div>
			</section>
		</DashboardShell>
	);
};
