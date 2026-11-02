import { queryKeyPayments, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Payment';
import { Filters } from '@/domain/Filters';

export const getPayment = (payment_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyPayments.base, queryKeyDefault.get, payment_id],
		enabled: !!payment_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!payment_id) return;
			return repository.getPayment(payment_id);
		},
	});

	return {
		...queryInfo,
		payment: queryInfo.data?.data,
	};
};

export const getListPaymentsBasic = (loanId?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyPayments.base, queryKeyDefault.list, loanId],
		enabled: !!loanId,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getListPaymentsBasic(loanId);
		},
	});

	return {
		...queryInfo,
		payments: queryInfo.data?.payments,
	};
};

export const getListPayments = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyPayments.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getListPayments(filters);
		},
	});

	return {
		...queryInfo,
		payments: queryInfo.data?.payments,
	};
};

export const usePayPayment = () => {
	const mutation = useMutation({
		mutationFn: (data: { paymentId: string, value: number }) => {
			return repository.payPayment(data.paymentId, data.value);
		},
	});

	return mutation;
};