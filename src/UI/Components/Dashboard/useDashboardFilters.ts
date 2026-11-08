import { useCallback, useMemo, useState } from 'react';
import { getDashboardFilters } from '@/infrastructure/querys/Report';
import { DashboardParams } from '@/infrastructure/dto/DashboardDto';

/**
 * Filtros compartidos por los 3 reportes: Ruta y Recaudador (sin período). Las opciones salen de
 * `/reports/dashboard/filters`, que ya respeta marca y rol (el socio solo recibe sus rutas), y se
 * limitan entre sí en cascada: un recaudador acota las rutas y una ruta acota los recaudadores.
 */
export const useDashboardFilters = () => {
	const { filters, isLoading } = getDashboardFilters();
	const routes = useMemo(() => filters?.routes ?? [], [filters]);
	const collectors = useMemo(() => filters?.collectors ?? [], [filters]);

	const [routeId, setRouteIdState] = useState<string | undefined>();
	const [collectorId, setCollectorIdState] = useState<string | undefined>();

	const availableRoutes = useMemo(
		() => (collectorId ? routes.filter(route => route.collector_ids.includes(collectorId)) : routes),
		[routes, collectorId],
	);

	// Una ruta que ya no está disponible (p. ej. tras cambiar de recaudador) se ignora.
	const effectiveRouteId = routeId && availableRoutes.some(route => route.id === routeId) ? routeId : undefined;

	const availableCollectors = useMemo(() => {
		const route = routes.find(item => item.id === effectiveRouteId);
		return route ? collectors.filter(collector => route.collector_ids.includes(collector.id)) : collectors;
	}, [routes, collectors, effectiveRouteId]);

	const setRouteId = useCallback((id?: string) => {
		setRouteIdState(id);
		const route = routes.find(item => item.id === id);
		// Si el recaudador elegido no trabaja en la nueva ruta, se limpia para no dejar un filtro imposible.
		if (route && collectorId && !route.collector_ids.includes(collectorId)) setCollectorIdState(undefined);
	}, [routes, collectorId]);

	const params = useMemo<DashboardParams>(
		() => ({ route_id: effectiveRouteId, collector_id: collectorId }),
		[effectiveRouteId, collectorId],
	);

	return {
		isLoading,
		availableRoutes,
		availableCollectors,
		routeId: effectiveRouteId,
		collectorId,
		setRouteId,
		setCollectorId: setCollectorIdState,
		params,
	};
};

export type DashboardFiltersState = ReturnType<typeof useDashboardFilters>;
