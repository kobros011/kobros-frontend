import { FC, useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Empty, Segmented, Select, Skeleton, theme } from 'antd';
import { Client } from '@/domain/Client';
import { getRouteClients, useBulkMoveClients } from '@/infrastructure/querys/ClientRoute';
import { handleError } from '@/infrastructure/utils/handleError';
import { MoveTarget, PreviewRow, clampPosition, computeMove, pluralClients, previewWindow } from './moveLogic';
import { PriorityStepper } from './PriorityStepper';
import { ResponsivePanel } from './ResponsivePanel';

interface MoveClientsModalProps {
	open: boolean
	clients: Client[]
	/** Ruta filtrada en la lista (se usa como ruta inicial si todos los seleccionados están en ella). */
	routeId?: string
	onClose: () => void
	onDone: () => void
}

const STATUS_LABEL: Record<PreviewRow['status'], string> = { moved: 'Movido', shifted: 'Recorrido', same: 'Sin cambios' };

/** "Mover N clientes": ruta, destino (inicio / posición / final) y vista previa antes → después. */
export const MoveClientsModal: FC<MoveClientsModalProps> = ({ open, clients, routeId, onClose, onDone }) => {
	const { token } = theme.useToken();
	const { notification } = App.useApp();
	const mutation = useBulkMoveClients();

	// Solo se puede mover en bloque dentro de una ruta en la que estén TODOS los seleccionados.
	const commonRoutes = useMemo(() => {
		if (clients.length === 0) return [];
		const [first, ...rest] = clients;
		return (first.routes ?? []).filter(route => rest.every(client => client.routes?.some(item => item.routeId === route.routeId)));
	}, [clients]);

	const [selectedRoute, setSelectedRoute] = useState<string>();
	const [target, setTarget] = useState<MoveTarget>('start');
	const [position, setPosition] = useState(1);

	useEffect(() => {
		if (!open) return;
		const preferred = commonRoutes.find(route => route.routeId === routeId) ?? commonRoutes[0];
		setSelectedRoute(preferred?.routeId);
		setTarget('start');
		setPosition(1);
	}, [open, routeId, commonRoutes]);

	const { routeClients, isLoading } = getRouteClients(open ? selectedRoute : undefined);
	const movingIds = useMemo(
		() => clients.map(client => client.routes?.find(route => route.routeId === selectedRoute)?.clientRouteId).filter((id): id is string => !!id),
		[clients, selectedRoute],
	);
	const rows = useMemo(() => routeClients.map(item => ({ id: item.id, name: item.fullName, order: item.order ?? 0 })), [routeClients]);
	const total = rows.length;
	const preview = useMemo(() => computeMove(rows, movingIds, target, position), [rows, movingIds, target, position]);
	const visible = previewWindow(preview);

	const confirm = () => {
		if (!selectedRoute) return;
		mutation.mutate({ routeId: selectedRoute, clientRouteIds: movingIds, target, position: target === 'position' ? position : undefined }, {
			onSuccess: () => {
				const first = target === 'start' ? 1 : target === 'end' ? Math.max(total - movingIds.length + 1, 1) : clampPosition(position, total - movingIds.length + 1);
				notification.success({ message: `${pluralClients(movingIds.length)} ${movingIds.length === 1 ? 'movido' : 'movidos'}`, description: `Ahora desde la posición #${first}.` });
				onDone();
			},
			onError: error => notification.error({ message: 'No se pudo mover', description: handleError(error, 'Actualiza la lista e inténtalo de nuevo') }),
		});
	};

	const routeName = routeClients[0]?.routeName ?? commonRoutes.find(route => route.routeId === selectedRoute)?.routeName;

	return (
		<ResponsivePanel
			open={open}
			onClose={onClose}
			title={`Mover ${pluralClients(clients.length)}`}
			subtitle="Reubicación en bloque dentro de una misma ruta"
			footer={(
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
					<Button size="small" danger onClick={onClose}>Cancelar</Button>
					<Button size="small" type="primary" loading={mutation.isPending} disabled={!selectedRoute || movingIds.length === 0} onClick={confirm}>
						Mover {pluralClients(movingIds.length)}
					</Button>
				</div>
			)}
		>
			{commonRoutes.length === 0 ? (
				<Alert type="warning" showIcon message="Los clientes seleccionados no comparten ninguna ruta" description="Selecciona clientes de una misma ruta para moverlos en bloque." />
			) : (
				<div style={{ display: 'grid', gap: 14 }}>
					<div>
						<div className="pr-label">Ruta</div>
						<Select
							size="middle"
							style={{ width: '100%' }}
							value={selectedRoute}
							onChange={setSelectedRoute}
							options={commonRoutes.map(route => ({ value: route.routeId, label: `${route.routeName} · ${route.routeTotal} clientes` }))}
							aria-label="Ruta de destino"
						/>
						<div className="kb-mono pr-hint">
							{clients.map(client => `${client.fullName.split(' ')[0]} (#${client.routes?.find(route => route.routeId === selectedRoute)?.order ?? '?'})`).join(', ')}
						</div>
					</div>

					<div>
						<div className="pr-label">Ubicación de destino</div>
						<Segmented
							block
							value={target}
							onChange={value => setTarget(value as MoveTarget)}
							options={[{ value: 'start', label: 'Al inicio' }, { value: 'position', label: 'A la posición' }, { value: 'end', label: 'Al final' }]}
						/>
					</div>

					{target === 'position' && (
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 12, border: `1px solid ${token.colorBorderSecondary}` }}>
							<span style={{ fontSize: 12 }}>Insertar a partir del número:</span>
							<PriorityStepper value={position} max={Math.max(total - movingIds.length + 1, 1)} onChange={setPosition} />
						</div>
					)}

					<div>
						<div className="pr-label">Vista previa de la secuencia</div>
						<div className="pr-preview" aria-live="polite">
							{isLoading ? <Skeleton active paragraph={{ rows: 3 }} title={false} /> : visible.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="La ruta no tiene clientes" /> : visible.map(row => (
								<div key={row.id} className={`pr-preview-row is-${row.status}`}>
									<span className="kb-mono">#{row.newOrder} {row.name}</span>
									<span className="pr-tag">{row.status === 'shifted' ? `Recorrido (${row.newOrder - row.order > 0 ? '+' : ''}${row.newOrder - row.order})` : STATUS_LABEL[row.status]}</span>
								</div>
							))}
							<div className="pr-hint">Los demás clientes de {routeName ?? 'la ruta'} se recorren automáticamente, sin dejar huecos.</div>
						</div>
					</div>
				</div>
			)}
		</ResponsivePanel>
	);
};
