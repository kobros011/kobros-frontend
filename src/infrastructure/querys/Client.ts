import { queryKeyClients, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Client';
import { Client } from '@/domain/Client';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';

export const getClient = (client_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyClients.base, queryKeyDefault.get, client_id],
		enabled: !!client_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!client_id) return;
			return repository.getClient(client_id);
		},
	});

	return {
		...queryInfo,
		client: queryInfo.data?.data,
	};
};
export const getClientMoreInfo = (client_id?: string, route_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyClients.base, queryKeyDefault.get, client_id, route_id],
		enabled: !!client_id && !!route_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!client_id || !route_id) return;
			return repository.getClientMoreInfo(client_id, route_id);
		},
	});

	return {
		...queryInfo,
		client: queryInfo.data?.data,
	};
};

export const getListClients = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyClients.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getListClients(filters);
		},
	});

	return {
		...queryInfo,
		clients: queryInfo.data?.clients,
	};
};

export const getPageClients = (filters: Partial<Filters>, pagination: PaginationParams, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyClients.base, queryKeyDefault.list, 'page', filters, pagination],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPage(filters, pagination),
	});

	return {
		...queryInfo,
		clients: queryInfo.data?.page.items,
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const createClient = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Client>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateClient = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Client>) => {
			return repository.update(data);
		},
	});

	return mutation;
};
export const deleteClient = () => {
	const mutation = useMutation({
		mutationFn: (client_id: string) => {
			return repository.delete(client_id);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createClient(),
		update: updateClient(),
	};

	return jsonType[type];
};