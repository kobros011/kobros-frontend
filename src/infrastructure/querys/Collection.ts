import { queryKeyCollection, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repository } from '../repositories/Collection';
import { repository as paymentRepository } from '../repositories/Payment';

export const getListCollection = (routeId?: string, date?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyCollection.base, queryKeyDefault.list, routeId, date],
		enabled: !!routeId,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!routeId) return;
			return repository.getListCollection(routeId, date);
		},
	});

	return {
		...queryInfo,
		collection: queryInfo.data?.collection ?? [],
	};
};

export const usePayCollection = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (data: { paymentId: string; value: number }) => {
			return paymentRepository.payPayment(data.paymentId, data.value);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [queryKeyCollection.base] });
		},
	});

	return mutation;
};
