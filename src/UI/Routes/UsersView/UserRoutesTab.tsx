import { FC, useState } from 'react';
import { Alert, App, Button, Select, Tag, Typography } from 'antd';
import { CompassOutlined, PlusOutlined, SafetyCertificateOutlined, WarningOutlined } from '@ant-design/icons';
import { UserRoute } from '@/domain/User';
import { getUserRoutes, useUserRouteMutations } from '@/infrastructure/querys/User';
import { handleError } from '@/infrastructure/utils/handleError';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import './userRoutes.css';

const { Text } = Typography;

interface UserRoutesTabProps {
	userId: string
	userName: string
	/** Dev o super: ven todas las rutas de su marca y no se asignan por ruta. */
	seesAllRoutes: boolean
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const pendingText = (route: UserRoute) => {
	const parts = [];
	if (route.pendingPayments) parts.push(plural(route.pendingPayments, 'cobro', 'cobros') + ' sin liquidar');
	if (route.openLiquidations) parts.push(plural(route.openLiquidations, 'cierre abierto', 'cierres abiertos'));
	return parts.join(' y ');
};

const SEARCH_FROM = 8;

/** Pestaña "Rutas" de Actualizar usuario: a qué rutas pertenece, asignarlo a otra o quitarlo. Cada cambio se guarda al instante. */
export const UserRoutesTab: FC<UserRoutesTabProps> = ({ userId, userName, seesAllRoutes }) => {
	const { notification } = App.useApp();
	const { routes = [], isLoading, isError } = getUserRoutes(userId, !seesAllRoutes);
	const { assign, remove } = useUserRouteMutations(userId);

	const [adding, setAdding] = useState(false);
	const [selected, setSelected] = useState<string>();
	const [notice, setNotice] = useState<string>();
	const [recent, setRecent] = useState<string>();
	const [confirming, setConfirming] = useState<UserRoute>();

	const firstName = userName.split(' ')[0] || userName;
	const assigned = routes.filter(route => route.assigned);
	const available = routes.filter(route => !route.assigned);

	if (seesAllRoutes) {
		return (
			<DashboardShell>
				<div className="kb-ur">
					<Alert
						type="info"
						showIcon
						icon={<SafetyCertificateOutlined />}
						message="Este usuario ve todas las rutas de su marca."
						description="Por su rol tiene permisos globales para supervisar y operar en cualquiera de las rutas, sin asignaciones manuales."
					/>
					<section className="kb-ur-card" aria-label="Privilegios automáticos">
						<strong>Privilegios automáticos</strong>
						<ul className="kb-ur-list">
							<li>Acceso al consolidado de todas las rutas.</li>
							<li>Revisión de cobros del día y cierres de caja.</li>
							<li>Reordenamiento y prioridad de cartera.</li>
						</ul>
					</section>
				</div>
			</DashboardShell>
		);
	}

	if (isLoading) return <LoadingComponent label="Cargando rutas" />;
	if (isError) return <Alert type="error" showIcon message="No se pudieron cargar las rutas del usuario" />;

	const closeAdding = () => {
		setAdding(false);
		setSelected(undefined);
	};

	const onAssign = () => {
		const route = routes.find(item => item.routeId === selected);
		if (!route) return;
		assign.mutate(route.routeId, {
			onSuccess: () => {
				setNotice(`${route.name} asignada`);
				setRecent(route.routeId);
				closeAdding();
			},
			onError: error => notification.error({ message: handleError(error, 'No se pudo asignar la ruta') }),
		});
	};

	const doRemove = (route: UserRoute) => {
		remove.mutate(route.routeId, {
			onSuccess: () => {
				setConfirming(undefined);
				setRecent(undefined);
				setNotice(undefined);
				notification.success({ message: `${route.name} quitada` });
			},
			onError: error => notification.error({ message: handleError(error, 'No se pudo quitar la ruta') }),
		});
	};

	const onRemoveClick = (route: UserRoute) => {
		if (route.pendingPayments || route.openLiquidations) setConfirming(route);
		else doRemove(route);
	};

	const assignButton = (
		<Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => setAdding(true)} disabled={available.length === 0}>
			Asignar ruta
		</Button>
	);

	return (
		<DashboardShell>
			<div className="kb-ur">
				{notice && (
					<Alert type="success" showIcon closable onClose={() => setNotice(undefined)} message={notice} description="Guardado de inmediato en el usuario." />
				)}

				{confirming && (
					<section className="kb-ur-warning" role="alertdialog" aria-label={`Quitar a ${firstName} de ${confirming.name}`}>
						<strong><WarningOutlined /> ¿Quitar a {firstName} de {confirming.name}?</strong>
						<p>
							{firstName} tiene {pendingText(confirming)} en {confirming.name}. Si la quitas, no podrá verlos hasta que la asignes de nuevo.
						</p>
						<div className="kb-ur-actions">
							<Button size="small" danger onClick={() => setConfirming(undefined)} disabled={remove.isPending}>Cancelar</Button>
							<Button size="small" type="primary" danger loading={remove.isPending} onClick={() => doRemove(confirming)}>Quitar ruta</Button>
						</div>
					</section>
				)}

				{adding && (
					<section className="kb-ur-card kb-ur-add" aria-label={`Asignar nueva ruta a ${firstName}`}>
						<div className="kb-ur-head">
							<strong>Asignar nueva ruta a {firstName}</strong>
							<Text type="secondary" style={{ fontSize: 12 }}>Paso rápido</Text>
						</div>
						<label htmlFor="user-route-select" className="kb-ur-label">Rutas disponibles en la marca</label>
						<Select
							id="user-route-select"
							size="small"
							autoFocus
							showSearch={available.length > SEARCH_FROM}
							optionFilterProp="label"
							placeholder="Selecciona una ruta…"
							value={selected}
							onChange={setSelected}
							options={available.map(route => ({ value: route.routeId, label: `${route.name} · ${route.currency}${route.active ? '' : ' · Inactiva'}` }))}
							style={{ width: '100%' }}
						/>
						<Text type="secondary" style={{ fontSize: 12 }}>Solo se muestran las rutas que no tiene asignadas.</Text>
						<div className="kb-ur-actions">
							<Button size="small" danger onClick={closeAdding}>Cancelar</Button>
							<Button size="small" type="primary" disabled={!selected} loading={assign.isPending} onClick={onAssign}>Asignar</Button>
						</div>
					</section>
				)}

				{assigned.length === 0 ? (
					!adding && (
						<section className="kb-ur-empty" aria-label="Sin rutas asignadas">
							<CompassOutlined style={{ fontSize: 22 }} />
							<strong>Sin rutas asignadas</strong>
							<Text type="secondary" style={{ fontSize: 13 }}>No podrá ver clientes ni registrar cobros hasta que le asignes una ruta.</Text>
							{assignButton}
						</section>
					)
				) : (
					<>
						<div className="kb-ur-head">
							<div>
								<strong>Rutas de {userName}</strong>
								<div><Text type="secondary" style={{ fontSize: 12 }}>Solo ve y cobra en las rutas asignadas.</Text></div>
							</div>
							{!adding && assignButton}
						</div>
						<ul className="kb-ur-routes" aria-label="Rutas asignadas">
							{assigned.map(route => {
								const pending = pendingText(route);
								return (
									<li key={route.routeId} className={`kb-ur-card${route.routeId === confirming?.routeId ? ' kb-ur-removing' : ''}${route.routeId === recent ? ' kb-ur-recent' : ''}`}>
										<div className="kb-ur-head">
											<span className="kb-ur-name">
												<strong>{route.name}</strong>
												<Tag style={{ margin: 0 }}>{route.currency}</Tag>
												{route.routeId === recent && <Tag color="lime" style={{ margin: 0 }}>Nueva</Tag>}
												<Tag color={route.active ? 'green' : 'default'} style={{ margin: 0 }}>{route.active ? 'Activa' : 'Inactiva'}</Tag>
											</span>
											<Button size="small" danger onClick={() => onRemoveClick(route)} loading={remove.isPending && remove.variables === route.routeId}>
												Quitar
											</Button>
										</div>
										{pending
											? <Text style={{ fontSize: 12, color: 'var(--kb-warn)' }}><WarningOutlined /> {pending}</Text>
											: <Text type="secondary" style={{ fontSize: 12 }}>Al día · Sin cobros pendientes</Text>}
									</li>
								);
							})}
						</ul>
						<Text type="secondary" style={{ fontSize: 12 }}>Cada cambio de ruta se guarda de inmediato.</Text>
					</>
				)}
			</div>
		</DashboardShell>
	);
};
