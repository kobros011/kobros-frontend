import { queryKeyDefault, queryKeyUsers } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/User';
import { User } from '@/domain/User';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

function meErrorMessage(error: unknown): string | undefined {
	if (!axios.isAxiosError(error)) return undefined;
	const data = error.response?.data as { detail?: unknown } | undefined;
	const detail = data?.detail;
	if (typeof detail === 'string') return detail;
	if (Array.isArray(detail)) {
		return detail
			.map((item: unknown) => {
				if (item && typeof item === 'object' && 'msg' in item && typeof (item as { msg: unknown }).msg === 'string') {
					return (item as { msg: string }).msg;
				}
				return String(item);
			})
			.join(' ');
	}
	return error.message || undefined;
}

export const getMe = () => {
	const { isSignedIn, getToken } = useAuth();
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyDefault.get, 'me'],
		enabled: isSignedIn,
		queryFn: async () => {
			const token = await getToken();
			if (!token) {
				throw new Error('Sesión de Clerk sin token. Intenta cerrar sesión y volver a entrar.');
			}
			return repository.getMe();
		},
		retry: (failureCount, error) => {
			if (axios.isAxiosError(error) && error.response?.status === 401 && failureCount < 2) {
				return true;
			}
			return failureCount < 1;
		},
	});

	return {
		user: queryInfo.data?.data,
		isLoading: queryInfo.isLoading,
		isError: queryInfo.isError,
		isFetching: queryInfo.isFetching,
		errorMessage: meErrorMessage(queryInfo.error),
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