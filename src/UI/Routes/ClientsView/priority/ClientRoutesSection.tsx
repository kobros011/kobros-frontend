import { FC, useState } from 'react';
import { Alert, App, Button, Select } from 'antd';
import { LockOutlined, PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Client } from '@/domain/Client';
import { queryKeyClientRoutes, queryKeyClients } from '@/constants/queryKeys';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { useSingleRoute } from '@/infrastructure/hooks/useSingleRoute';
import { updateClient } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { PriorityBadge } from './PriorityChip';
import { PriorityDrawer } from './PriorityDrawer';
import './priority.css';

interface ClientRoutesSectionProps {
	client: Client
	canManage: boolean
	readonly?: boolean
}

/** Formulario de cliente: rutas asignadas con su prioridad. Administración puede asignar otra ruta, cambiar el # o quitar una ruta. */
export const ClientRoutesSection: FC<ClientRoutesSectionProps> = ({ client, canManage, readonly }) => {
	const { notification, modal } = App.useApp();
	const queryClient = useQueryClient();
	const { routes: allRoutes } = useRoutes();
	const singleRoute = useSingleRoute(); // una sola ruta: solo importa la prioridad, no el nombre de la ruta
	const update = updateClient();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [newRoute, setNewRoute] = useState<string>();

	const routes = client.routes ?? [];
	const editable = canManage && !readonly;
	const available = allRoutes.filter(route => !routes.some(item => item.routeId === route.id));

	const save = (routesIds: string[], done: string) => update.mutate({ ...client, routesIds }, {
		onSuccess: () => {
			notification.success({ message: done });
			setNewRoute(undefined);
			for (const key of [queryKeyClients.base, queryKeyClientRoutes.base]) void queryClient.invalidateQueries({ queryKey: [key] });
		},
		onError: error => notification.error({ message: 'No se pudo actualizar las rutas', description: handleError(error, 'Inténtalo de nuevo') }),
	});

	const remove = (routeId: string, routeName: string, order: number) => {
		void modal.confirm({
			title: `¿Quitar a ${client.fullName} de ${routeName}?`,
			content: `Esta acción removerá su posición #${order} y reajustará a los clientes siguientes.`,
			okText: 'Confirmar retiro',
			cancelText: 'Volver',
			okButtonProps: { size: 'small', danger: true },
			cancelButtonProps: { size: 'small' },
			centered: true,
			onOk: () => save(routes.filter(item => item.routeId !== routeId).map(item => item.routeId), `${client.fullName} salió de ${routeName}`),
		});
	};

	return (
		<DashboardShell>
			<section className="pr-card" aria-label="Rutas y prioridad asignadas" style={{ marginTop: 12 }}>
				<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					<div>
						{singleRoute ? <strong>Prioridad del cliente</strong> : <><strong>Rutas y prioridad asignadas</strong> <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>({routes.length} {routes.length === 1 ? 'ruta activa' : 'rutas activas'})</span>
							<div className="pr-hint" style={{ marginTop: 2 }}>Un cliente puede estar en más de una ruta con prioridades independientes.</div></>}
					</div>
					{canManage && <Button size="small" onClick={() => setDrawerOpen(true)} disabled={routes.length === 0}>Cambiar prioridades</Button>}
				</header>

				<div style={{ display: 'grid', gap: 8 }}>
					{routes.length === 0 && <Alert type="info" showIcon message="Este cliente aún no tiene rutas" />}
					{routes.map(route => (
						<div key={route.clientRouteId} className="pr-row">
							<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
								<PriorityBadge order={route.order} />
								<div>
									{singleRoute
										? <strong>Prioridad #{route.order}</strong>
										: <><strong>{route.routeName}</strong>
											<div className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>#{route.order} de {route.routeTotal}</div></>}
									{singleRoute && <div className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>de {route.routeTotal} clientes</div>}
								</div>
							</div>
							{editable && (
								<Button size="small" danger icon={routes.length === 1 ? <LockOutlined /> : undefined} disabled={routes.length === 1} title={routes.length === 1 ? 'Un cliente debe tener al menos una ruta' : undefined} onClick={() => remove(route.routeId, route.routeName, route.order)}>
									Quitar
								</Button>
							)}
						</div>
					))}
				</div>

				{editable && (
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
						<Select
							size="small" style={{ minWidth: 220 }} showSearch optionFilterProp="label" placeholder="Asignar a otra ruta…" aria-label="Ruta a agregar"
							value={newRoute} onChange={setNewRoute} disabled={available.length === 0}
							options={available.map(route => ({ value: route.id, label: route.name }))}
						/>
						<Button size="small" type="primary" icon={<PlusOutlined />} disabled={!newRoute} loading={update.isPending} onClick={() => newRoute && save([...routes.map(item => item.routeId), newRoute], 'Ruta asignada al final de su lista')}>
							Asignar ruta
						</Button>
					</div>
				)}

				{editable && <Alert type="warning" showIcon style={{ fontSize: 12 }} message="Protección de cartera activa" description="Para quitar a un cliente de una ruta, primero liquida o transfiere los créditos con cuotas pendientes que tenga en ella." />}
			</section>
			<PriorityDrawer open={drawerOpen} canManage={canManage} client={client} onClose={() => setDrawerOpen(false)} />
		</DashboardShell>
	);
};
