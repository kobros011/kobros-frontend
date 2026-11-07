import { queryKeyDefault, queryKeyRouteMovements } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repository } from '../repositories/RouteMovement';
import { RouteMovementCreateDto } from '../dto/RouteMovementDto';

export const getListRouteMovements = (routeId: string | undefined, page: number, pageSize: number) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyRouteMovements.base, queryKeyDefault.list, routeId, page, pageSize],
		enabled: !!routeId,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getList(routeId!, { page, pageSize }),
	});

	return {
		...queryInfo,
		movements: queryInfo.data?.page.items ?? [],
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const getRouteCashSummary = (routeId?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyRouteMovements.base, queryKeyRouteMovements.summary, routeId],
		enabled: !!routeId,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getSummary(routeId!),
	});

	return { ...queryInfo, summary: queryInfo.data?.summary };
};

export const useCreateRouteMovement = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: RouteMovementCreateDto) => repository.create(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [queryKeyRouteMovements.base] });
		},
	});
};
