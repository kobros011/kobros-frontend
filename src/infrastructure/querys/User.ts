import { queryKeyUsers } from '@/constants/queryKeys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/User';

export const getUser = (user_id: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyUsers.base, queryKeyUsers.get, user_id],
		enabled: !!user_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getUser(user_id);
		},
	});

	return {
		...queryInfo,
		user: queryInfo.data?.data,
	};
};