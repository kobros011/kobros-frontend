import { queryKeyLoans, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Loan';
import { Loan, LoanFull } from '@/domain/Loan';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';

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
	const mutation = useMutation({
		mutationFn: (data: Partial<LoanFull>) => {
			return repository.create(data);
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