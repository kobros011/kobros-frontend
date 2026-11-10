import { queryKeyLoans, queryKeyDefault, queryKeyClients, queryKeyPayments, queryKeyCollection, queryKeyReports } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repository } from '../repositories/Loan';
import { Loan, LoanFull } from '@/domain/Loan';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';

export const getAvailableCash = (route_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLoans.base, 'available-cash', route_id],
		enabled: !!route_id,
		queryFn: () => repository.availableCash(route_id!),
	});
	return { ...queryInfo, available: queryInfo.data };
};

export const getLoan = (loan_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLoans.base, queryKeyDefault.get, loan_id],
		enabled: !!loan_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!loan_id) return;
			return repository.getLoan(loan_id);
		},
	});

	return {
		...queryInfo,
		loan: queryInfo.data?.data,
	};
};

export const getListLoans = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLoans.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.listLoans(filters);
		},
	});

	return {
		...queryInfo,
		loans: queryInfo.data?.data,
	};
};

export const getPageLoans = (filters: Partial<Filters>, pagination: PaginationParams, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLoans.base, queryKeyDefault.list, 'page', filters, pagination],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPage(filters, pagination),
	});

	return {
		...queryInfo,
		loans: queryInfo.data?.page.items,
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const getLoanMoreInfo = (loan_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLoans.base, queryKeyDefault.get, loan_id],
		enabled: !!loan_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!loan_id) return;

			return repository.getLoan(loan_id);
		},
	});

	return {
		...queryInfo,
		loan: queryInfo.data?.data,
	};
};


export const createLoan = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (data: Partial<LoanFull>) => {
			return repository.create(data);
		},
		// Un crédito nuevo mueve cartera, historial del cliente, Cobro del día y reportes (y el cobro inicial, los pagos).
		onSuccess: () => {
			for (const key of [queryKeyLoans.base, queryKeyClients.base, queryKeyPayments.base, queryKeyCollection.base, queryKeyReports.base]) {
				void queryClient.invalidateQueries({ queryKey: [key] });
			}
		},
	});

	return mutation;
};

export const updateLoan = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Loan>) => {
			return repository.update(data);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createLoan(),
		update: updateLoan(),
	};

	return jsonType[type];
};