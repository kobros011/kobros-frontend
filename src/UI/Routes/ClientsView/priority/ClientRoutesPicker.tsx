import { FC, useEffect } from 'react';
import { Segmented, Select, Skeleton, Typography } from 'antd';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { getRouteClients } from '@/infrastructure/querys/ClientRoute';
import { PriorityStepper } from './PriorityStepper';
import './priority.css';

const { Text } = Typography;

export interface RouteAssignment {
	routeId: string
	/** Prioridad pedida en la ruta; `undefined` = al final. */
	order?: number
}

interface RouteRowProps {
	name: string
	assignment: RouteAssignment
	onOrder: (order?: number) => void
	disabled?: boolean
}

/** Prioridad del cliente nuevo en UNA ruta: al final o en una posición, mostrando cuántos clientes tiene ya la ruta. */
const RouteRow: FC<RouteRowProps> = ({ name, assignment, onOrder, disabled }) => {
	const { routeClients, isLoading } = getRouteClients(assignment.routeId);
	const last = routeClients.length + 1; // el cliente nuevo ocupa el lugar total + 1 si va al final
	const specific = assignment.order !== undefined;
	const position = Math.min(assignment.order ?? last, last);

	return (
		<section className="pr-card" aria-label={`Prioridad en ${name}`} style={{ marginTop: 8 }}>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
				<strong>{name}</strong>
				{isLoading ? <Skeleton.Button active size="small" /> : <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>{routeClients.length} {routeClients.length === 1 ? 'cliente' : 'clientes'} hoy</span>}
			</header>
			<Segmented
				size="small"
				block
				disabled={disabled}
				value={specific ? 'position' : 'end'}
				onChange={next => onOrder(next === 'end' ? undefined : position)}
				options={[{ value: 'end', label: `Al final (#${last})` }, { value: 'position', label: 'Posición específica' }]}
			/>
			{specific && (
				<div style={{ marginTop: 8 }}>
					<PriorityStepper value={position} max={last} disabled={disabled} onChange={onOrder} label={`Posición en ${name}`} />
					<Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
						{position < last ? 'Los clientes desde esa posición se recorren un lugar.' : 'Quedará al final de la ruta.'}
					</Text>
				</div>
			)}
		</section>
	);
};

interface ClientRoutesPickerProps {
	/** Control de `Form.Item`. */
	value?: RouteAssignment[]
	onChange?: (value: RouteAssignment[]) => void
	disabled?: boolean
}

/** Al crear un cliente: rutas a las que se asigna y su prioridad en cada una (opcional; sin prioridad va al final). */
export const ClientRoutesPicker: FC<ClientRoutesPickerProps> = ({ value = [], onChange, disabled }) => {
	const { routes } = useRoutes();
	const options = routes.map(route => ({ value: route.id, label: route.name }));
	const nameOf = (id: string) => routes.find(route => route.id === id)?.name ?? 'Ruta';

	// Con una sola ruta disponible ya viene marcada.
	useEffect(() => {
		if (routes.length === 1 && value.length === 0) onChange?.([{ routeId: routes[0].id }]);
	}, [routes, value.length, onChange]);

	const setRoutes = (ids: string[]) => onChange?.(ids.map(id => value.find(item => item.routeId === id) ?? { routeId: id }));
	const setOrder = (routeId: string, order?: number) => onChange?.(value.map(item => (item.routeId === routeId ? { ...item, order } : item)));

	return (
		<div>
			<Select
				mode="multiple"
				size="small"
				style={{ width: '100%' }}
				placeholder="Elige una o varias rutas"
				aria-label="Rutas del cliente"
				disabled={disabled}
				options={options}
				optionFilterProp="label"
				value={value.map(item => item.routeId)}
				onChange={setRoutes}
			/>
			{value.map(item => (
				<RouteRow key={item.routeId} name={nameOf(item.routeId)} assignment={item} disabled={disabled} onOrder={order => setOrder(item.routeId, order)} />
			))}
		</div>
	);
};
