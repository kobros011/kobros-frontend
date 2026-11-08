import '@/UI/Components/Dashboard/ui'; // fuentes y clase .kb-mono del kit
import { FC } from 'react';
import { theme } from 'antd';
import { ClientRouteInfo } from '@/domain/Client';

const HOT_LIMIT = 3;

/** Prioridad 1–3 = "caliente" (relleno con el color de marca); el resto, neutra. Nunca depende solo del color: siempre lleva el número. */
export const isHot = (order?: number) => !!order && order <= HOT_LIMIT;

interface PriorityBadgeProps {
	order: number
	size?: number
	state?: 'default' | 'moving' | 'moved'
}

/** Cuadro con el número de prioridad (#1, #12…). */
export const PriorityBadge: FC<PriorityBadgeProps> = ({ order, size = 32, state = 'default' }) => {
	const { token } = theme.useToken();
	const hot = isHot(order);
	const active = state !== 'default';
	return (
		<span
			className="kb-mono"
			aria-label={`Prioridad ${order}`}
			style={{
				display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
				width: size, height: size, borderRadius: 10, fontWeight: 800, fontSize: size >= 32 ? 14 : 12,
				background: active ? `${token.colorPrimary}33` : hot ? token.colorPrimary : token.colorFillSecondary,
				color: active ? token.colorPrimary : hot ? '#0e0e0e' : token.colorTextTertiary,
				border: `1px solid ${active ? token.colorPrimary : hot ? token.colorPrimary : token.colorBorderSecondary}`,
			}}
		>
			{order}
		</span>
	);
};

interface RouteChipProps {
	routeName: string
	order: number
	highlight?: boolean
}

/** Píldora "Ruta Norte · #3". */
export const RouteChip: FC<RouteChipProps> = ({ routeName, order, highlight }) => {
	const { token } = theme.useToken();
	const hot = highlight ?? isHot(order);
	return (
		<span
			className="kb-mono"
			style={{
				display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 999, fontSize: 11, lineHeight: '18px', whiteSpace: 'nowrap',
				background: hot ? token.colorPrimary : token.colorFillQuaternary,
				color: hot ? '#0e0e0e' : token.colorTextSecondary,
				border: `1px solid ${hot ? token.colorPrimary : token.colorBorderSecondary}`,
				fontWeight: hot ? 700 : 500,
			}}
		>
			{routeName}
			<span style={{ paddingLeft: 6, borderLeft: `1px solid ${hot ? 'rgba(0,0,0,0.25)' : token.colorBorder}`, fontWeight: 800 }}>#{order}</span>
		</span>
	);
};

/** Todas las rutas del cliente con su prioridad; si no caben, "+N". */
export const RouteChips: FC<{ routes?: ClientRouteInfo[], max?: number }> = ({ routes = [], max = 2 }) => {
	const { token } = theme.useToken();
	if (routes.length === 0) return <span style={{ color: token.colorTextTertiary }}>Sin rutas</span>;
	const shown = routes.slice(0, max);
	const hidden = routes.slice(max);
	return (
		<span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
			{shown.map(route => <RouteChip key={route.clientRouteId} routeName={route.routeName} order={route.order} />)}
			{hidden.length > 0 && (
				<span className="kb-mono" title={hidden.map(route => `${route.routeName} #${route.order}`).join(', ')} style={{ fontSize: 11, color: token.colorTextTertiary }}>
					+{hidden.length}
				</span>
			)}
		</span>
	);
};
