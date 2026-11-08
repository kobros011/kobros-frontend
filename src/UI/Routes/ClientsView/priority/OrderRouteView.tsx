import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, App, Button, Empty, Input, Result, Select, Skeleton } from 'antd';
import { ArrowLeftOutlined, CloseOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { getRouteClients, useReorderRoute } from '@/infrastructure/querys/ClientRoute';
import { handleError } from '@/infrastructure/utils/handleError';
import { DragRow, RowMark } from './DragRow';
import { pluralClients } from './moveLogic';
import { useCanManagePriority } from './usePriorityAccess';
import './priority.css';

function arrayMove<T>(list: T[], from: number, to: number): T[] {
	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(Math.min(Math.max(to, 0), next.length), 0, item);
	return next;
}

/** "Reordenar secuencia de visita": arrastrar, ▲ ▼ o "Mover a #"; los cambios son locales hasta pulsar "Guardar orden". */
const OrderRouteView: FC = () => {
	const navigate = useNavigate();
	const { notification, modal } = App.useApp();
	const canManage = useCanManagePriority();
	const { routes } = useRoutes();
	const [params, setParams] = useSearchParams();
	const routeId = params.get('ruta') ?? (routes.length === 1 ? routes[0].id : undefined);

	const { routeClients, isLoading, isError, refetch } = getRouteClients(routeId);
	const reorder = useReorderRoute();

	const original = useMemo(() => routeClients.map(item => item.id), [routeClients]);
	const signature = original.join('|');
	const [order, setOrder] = useState<string[]>(original);
	useEffect(() => setOrder(original), [signature]);

	const byId = useMemo(() => new Map(routeClients.map(item => [item.id, item])), [routeClients]);
	const originalPosition = useMemo(() => new Map(original.map((id, index) => [id, index + 1])), [original]);
	const changes = order.filter((id, index) => originalPosition.get(id) !== index + 1).length;

	const [dragId, setDragId] = useState<string>();
	const [overIndex, setOverIndex] = useState<number>();
	const [search, setSearch] = useState('');
	const [found, setFound] = useState<string>();
	const listRef = useRef<HTMLDivElement>(null);

	// Con cambios sin guardar avisa antes de salir; sin cambios vuelve directo al listado (no por el historial de rutas elegidas).
	const goToClients = () => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.CLIENTS}`);
	const leave = () => {
		if (changes === 0) {
			goToClients();
			return;
		}
		void modal.confirm({
			title: '¿Salir sin guardar?',
			content: `Tienes ${changes} ${changes === 1 ? 'cambio' : 'cambios'} sin guardar. Si sales ahora se perderán.`,
			okText: 'Salir sin guardar',
			cancelText: 'Seguir editando',
			okButtonProps: { danger: true, size: 'small' },
			cancelButtonProps: { size: 'small' },
			centered: true,
			onOk: goToClients,
		});
	};

	// Cerrar o recargar la pestaña con cambios pendientes también pide confirmación.
	useEffect(() => {
		if (changes === 0) return;
		const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [changes]);

	const moveTo = (id: string, to: number) => setOrder(current => arrayMove(current, current.indexOf(id), to - 1));
	const clearDrag = () => { setDragId(undefined); setOverIndex(undefined); };

	const jump = (text: string) => {
		setSearch(text);
		const query = text.trim().toLowerCase();
		const match = query ? order.find(id => byId.get(id)?.fullName.toLowerCase().includes(query)) : undefined;
		setFound(match);
		if (match) listRef.current?.querySelector(`#pr-row-${match}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	};

	const save = () => {
		if (!routeId) return;
		const previous = original;
		reorder.mutate({ routeId, orderedIds: order }, {
			onSuccess: () => {
				const key = `reorder-${Date.now()}`;
				notification.success({
					key,
					message: `${pluralClients(changes)} reordenados`,
					description: `Se actualizó el orden en ${byId.get(order[0])?.routeName ?? 'la ruta'}.`,
					duration: 4,
					btn: <Button size="small" type="link" onClick={() => { notification.destroy(key); reorder.mutate({ routeId, orderedIds: previous }); }}>Deshacer</Button>,
				});
			},
			onError: error => notification.error({ message: 'No se pudo guardar el orden', description: handleError(error, 'Actualiza la ruta e inténtalo de nuevo') }),
		});
	};

	if (!canManage) {
		return <Result status="403" title="Solo administración" subTitle="Los cobradores y socios pueden ver la prioridad, pero no cambiarla." extra={<Button onClick={goToClients}>Volver</Button>} />;
	}

	const routeName = routeClients[0]?.routeName ?? routes.find(route => route.id === routeId)?.name;

	return (
		<DashboardShell>
			<header className="kb-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
					<Button aria-label="Volver a Clientes" icon={<ArrowLeftOutlined />} onClick={leave} style={{ width: 40, height: 40 }} />
					<div style={{ minWidth: 0 }}>
						<h1 className="kb-section-title" style={{ margin: 0 }}>Reordenar secuencia de visita {routeName && <span className="kb-mono" style={{ color: 'var(--kb-primary)' }}>· {routeName}</span>}</h1>
						<div className="kb-section-sub">Arrastra los clientes, usa ▲ ▼ o “#” para definir el recorrido del cobrador.</div>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
					{changes > 0 && <span className="kb-mono" role="status" style={{ padding: '2px 10px', borderRadius: 10, border: '1px solid var(--kb-warn)', color: 'var(--kb-warn)', fontSize: 12 }}>{changes} {changes === 1 ? 'cambio' : 'cambios'} sin guardar</span>}
					<Button size="small" danger icon={<CloseOutlined />} disabled={changes === 0} onClick={() => setOrder(original)}>Descartar</Button>
					<Button size="small" type="primary" icon={<SaveOutlined />} disabled={changes === 0} loading={reorder.isPending} onClick={save}>Guardar orden</Button>
				</div>
			</header>

			<div className="kb-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12, fontSize: 12 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
					{routes.length > 1 && (
						<Select
							size="small" showSearch optionFilterProp="label" style={{ minWidth: 220 }} placeholder="Elige o busca una ruta" aria-label="Ruta a ordenar" value={routeId}
							onChange={value => { setParams({ ruta: value }, { replace: true }); setSearch(''); }}
							options={routes.map(route => ({ value: route.id, label: route.name }))}
						/>
					)}
					{routeId && <span>Total en esta ruta: <strong className="kb-mono">{pluralClients(order.length)}</strong> · Los números se recalculan solos, sin huecos.</span>}
				</div>
				<Input allowClear size="small" style={{ width: 220 }} prefix={<SearchOutlined />} placeholder="Saltar a un cliente…" aria-label="Saltar a un cliente" value={search} onChange={event => jump(event.target.value)} />
			</div>

			{!routeId && <Empty description="Elige una ruta para ordenar a sus clientes" />}
			{routeId && isLoading && <Skeleton active paragraph={{ rows: 6 }} />}
			{routeId && isError && <Alert type="error" showIcon message="No se pudo cargar la ruta" action={<Button size="small" onClick={() => void refetch()}>Reintentar</Button>} />}
			{routeId && !isLoading && !isError && order.length === 0 && <Empty description="No hay clientes asignados a esta ruta" />}

			<div ref={listRef} style={{ display: 'grid', gap: 8 }}>
				{order.map((id, index) => {
					const item = byId.get(id);
					if (!item) return null;
					const position = index + 1;
					const before = originalPosition.get(id) ?? position;
					const mark: RowMark = dragId === id ? 'dragging' : id === found && search ? 'none' : before !== position ? (changes <= 1 || Math.abs(before - position) > 1 ? 'moved' : 'shifted') : 'none';
					return (
						<DragRow
							key={id}
							item={item}
							position={position}
							total={order.length}
							originalPosition={before}
							mark={mark}
							highlighted={id === found && !!search}
							dropLabel={dragId && overIndex === index && dragId !== id ? `Mover a posición #${position}` : undefined}
							disabled={reorder.isPending}
							onDragStart={() => setDragId(id)}
							onDragOver={event => { event.preventDefault(); if (overIndex !== index) setOverIndex(index); }}
							onDrop={() => { if (dragId) moveTo(dragId, position); clearDrag(); }}
							onDragEnd={clearDrag}
							onMoveUp={() => moveTo(id, position - 1)}
							onMoveDown={() => moveTo(id, position + 1)}
							onMoveTo={target => moveTo(id, target)}
						/>
					);
				})}
			</div>
		</DashboardShell>
	);
};

export default OrderRouteView;
