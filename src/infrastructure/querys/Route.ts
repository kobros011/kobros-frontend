import { queryKeyDefault, queryKeyRoutes } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Route';
import { Route } from '@/domain/Route';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';

export const getRoute = (route_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyRoutes.base, queryKeyDefault.get, route_id],
		enabled: !!route_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!route_id) return;
			return repository.getRoute(route_id);
		},
	});

	return {
		...queryInfo,
		route: queryInfo.data?.data,
	};
};

export const getListRoutes = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyRoutes.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getList(filters);
		},
	});

	return {
		...queryInfo,
		routes: queryInfo.data?.data,
	};
};

export const createRoute = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Route>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateRoute = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Route>) => {
			return repository.update(data);
		},
	});

	return mutation;
};
export const deleteRoute = () => {
	const mutation = useMutation({
		mutationFn: (route_id: string) => {
			return repository.delete(route_id);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createRoute,
		update: updateRoute,
	};

	return jsonType[type];
};