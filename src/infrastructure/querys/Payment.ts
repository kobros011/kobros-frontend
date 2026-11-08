import { queryKeyPayments, queryKeyDefault, queryKeyCollection, queryKeyLoans, queryKeyReports } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationParams } from '@/domain/Pagination';
import { PaymentHistoryStatus } from '../dto/PaymentHistoryDto';
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

export const getPaymentHistory = (loanId: string | undefined, status: PaymentHistoryStatus | undefined, pagination: PaginationParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyPayments.base, 'history', loanId, status, pagination],
		enabled: !!loanId,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPaymentHistory(loanId as string, status, pagination),
	});

	return { ...queryInfo, history: queryInfo.data };
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
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (data: { paymentId: string, value: number }) => {
			return repository.payPayment(data.paymentId, data.value);
		},
		// Un abono mueve el historial, Cobro del día, el crédito (cuotas/mora) y los reportes.
		onSuccess: () => {
			for (const key of [queryKeyPayments.base, queryKeyCollection.base, queryKeyLoans.base, queryKeyReports.base]) {
				void queryClient.invalidateQueries({ queryKey: [key] });
			}
		},
	});

	return mutation;
};