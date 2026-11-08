import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeyClientRoutes, queryKeyClients, queryKeyCollection, queryKeyLoans } from '@/constants/queryKeys';
import { repository } from '../repositories/ClientRoute';

/** Clientes de una ruta ordenados por prioridad (1..n). */
export const getRouteClients = (routeId?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyClientRoutes.base, 'route', routeId],
		enabled: !!routeId,
		queryFn: async () => (await repository.getListClientRoutes(routeId ?? '')).clientRoutes ?? [],
	});

	return { ...queryInfo, routeClients: queryInfo.data ?? [] };
};

/** Mover prioridades cambia el listado de clientes, las rutas, "Cobro del día" y los créditos (campo `order`). */
const useInvalidateAfterMove = () => {
	const queryClient = useQueryClient();
	return () => {
		for (const key of [queryKeyClientRoutes.base, queryKeyClients.base, queryKeyCollection.base, queryKeyLoans.base]) {
			void queryClient.invalidateQueries({ queryKey: [key] });
		}
	};
};

export const useMoveClientRoute = () => {
	const invalidate = useInvalidateAfterMove();
	return useMutation({
		mutationFn: ({ clientRouteId, position }: { clientRouteId: string, position: number }) => repository.move(clientRouteId, position),
		onSuccess: invalidate,
	});
};

export const useReorderRoute = () => {
	const invalidate = useInvalidateAfterMove();
	return useMutation({
		mutationFn: ({ routeId, orderedIds }: { routeId: string, orderedIds: string[] }) => repository.reorder(routeId, orderedIds),
		onSuccess: invalidate,
	});
};

export const useBulkMoveClients = () => {
	const invalidate = useInvalidateAfterMove();
	return useMutation({
		mutationFn: (args: { routeId: string, clientRouteIds: string[], target: 'start' | 'end' | 'position', position?: number }) =>
			repository.bulkMove(args.routeId, args.clientRouteIds, args.target, args.position),
		onSuccess: invalidate,
	});
};
