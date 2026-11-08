import { FC, useEffect, useState } from 'react';
import { Alert, App, Button, Skeleton } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { Client, ClientRouteInfo } from '@/domain/Client';
import { getClient } from '@/infrastructure/querys/Client';
import { getRouteClients, useMoveClientRoute } from '@/infrastructure/querys/ClientRoute';
import { handleError } from '@/infrastructure/utils/handleError';
import { PriorityBadge } from './PriorityChip';
import { PriorityStepper } from './PriorityStepper';
import { ResponsivePanel } from './ResponsivePanel';
import { clampPosition } from './moveLogic';

const RoutePositionCard: FC<{ route: ClientRouteInfo, canManage: boolean }> = ({ route, canManage }) => {
	const { notification } = App.useApp();
	const move = useMoveClientRoute();
	const { routeClients, isLoading } = getRouteClients(route.routeId);

	const total = routeClients.length || route.routeTotal;
	const [position, setPosition] = useState(route.order);
	useEffect(() => setPosition(route.order), [route.order]);

	const sorted = [...routeClients].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	const previous = sorted.find(item => item.order === route.order - 1);
	const next = sorted.find(item => item.order === route.order + 1);
	const dirty = position !== route.order;

	const save = () => move.mutate({ clientRouteId: route.clientRouteId, position }, {
		onSuccess: () => notification.success({ message: `Prioridad actualizada en ${route.routeName}`, description: `Ahora es la #${position}.` }),
		onError: error => notification.error({ message: 'No se pudo guardar', description: handleError(error, 'Actualiza la lista e inténtalo de nuevo') }),
	});

	return (
		<section className="pr-card" aria-label={`Prioridad en ${route.routeName}`}>
			<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
				<strong>{route.routeName}</strong>
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<PriorityBadge order={route.order} size={28} />
					<span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>de {total}</span>
				</span>
			</header>

			{isLoading ? <Skeleton active title={false} paragraph={{ rows: 1 }} /> : (
				<div className="pr-neighbors kb-mono">
					<span>{previous ? `↑ #${previous.order} ${previous.fullName}` : '↑ Es el primero'}</span>
					<span style={{ textAlign: 'right' }}>{next ? `↓ #${next.order} ${next.fullName}` : '↓ Es el último'}</span>
				</div>
			)}

			{canManage ? (
				<>
					<div className="pr-label" style={{ margin: 0 }}>Cambiar orden en {route.routeName}</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
						<Button size="small" onClick={() => setPosition(1)} disabled={position === 1}>Inicio (#1)</Button>
						<PriorityStepper value={position} max={total} onChange={value => setPosition(clampPosition(value, total))} />
						<Button size="small" onClick={() => setPosition(total)} disabled={position === total}>Final (#{total})</Button>
					</div>
					<Button type="primary" size="small" icon={<CheckOutlined />} disabled={!dirty} loading={move.isPending} onClick={save} block>
						Guardar en {route.routeName}
					</Button>
				</>
			) : (
				<div style={{ fontSize: 12, color: 'var(--kb-muted)' }}>La prioridad la define la administración.</div>
			)}
		</section>
	);
};

interface PriorityDrawerProps {
	open: boolean
	client?: Pick<Client, 'id' | 'fullName' | 'idDocument' | 'currentMobile'>
	canManage: boolean
	onClose: () => void
}

/** "Gestión de prioridad": una tarjeta independiente por cada ruta del cliente. */
export const PriorityDrawer: FC<PriorityDrawerProps> = ({ open, client, canManage, onClose }) => {
	const { client: fresh, isLoading, isError } = getClient(open ? client?.id : undefined);
	const routes = fresh?.routes ?? [];

	return (
		<ResponsivePanel
			open={open}
			variant="drawer"
			onClose={onClose}
			title={client?.fullName ?? 'Gestión de prioridad'}
			subtitle={client ? `CC ${client.idDocument} · Cel: ${client.currentMobile}` : undefined}
			footer={<div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button size="small" onClick={onClose}>Cerrar</Button></div>}
		>
			<div style={{ display: 'grid', gap: 12 }}>
				{isError && <Alert type="error" showIcon message="No se pudieron cargar las rutas del cliente" />}
				{isLoading && <Skeleton active paragraph={{ rows: 4 }} />}
				{!isLoading && !isError && routes.length === 0 && <Alert type="info" showIcon message="Este cliente no está asignado a ninguna ruta" />}
				{routes.length > 1 && (
					<div style={{ fontSize: 12 }}>
						Este cliente está en <strong>{routes.length} rutas</strong>. Puedes cambiar su orden en cada una de forma independiente:
					</div>
				)}
				{routes.map(route => <RoutePositionCard key={route.clientRouteId} route={route} canManage={canManage} />)}
			</div>
		</ResponsivePanel>
	);
};
