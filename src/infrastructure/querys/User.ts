import { queryKeyDefault, queryKeyUsers } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/User';
import { User } from '@/domain/User';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';

export const getMe = () => {
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyDefault.get, 'me'],
		queryFn: () => repository.getMe(),
	});

	return {
		user: queryInfo.data?.data,
		isLoading: queryInfo.isLoading,
		isError: queryInfo.isError,
		isFetching: queryInfo.isFetching,
	};
};

export const getUserLogin = (user_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyDefault.get, 'login', user_id],
		enabled: !!user_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!user_id) return;

			return repository.getUser(user_id);
		},
	});

	return {
		...queryInfo,
		user: queryInfo.data?.data,
	};
};

export const getUser = (user_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyDefault.get, user_id],
		enabled: !!user_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!user_id) return;

			return repository.getUser(user_id);
		},
	});

	return {
		...queryInfo,
		user: queryInfo.data?.data,
	};
};

export const getListUsers = (filters: Filters, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getList(filters);
		},
	});

	return {
		...queryInfo,
		users: queryInfo.data?.data,
	};
};

export const createUser = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<User>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateUser = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<User>) => {
			return repository.update(data);
		},
	});

	return mutation;
};
export const deleteUser = () => {
	const mutation = useMutation({
		mutationFn: (user_id: string) => {
			return repository.delete(user_id);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createUser(),
		update: updateUser(),
	};

	return jsonType[type];
};