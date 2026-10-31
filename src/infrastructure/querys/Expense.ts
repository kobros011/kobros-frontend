import { queryKeyExpenses, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { TypeAction } from '@/constants/types';
import { repository } from '../repositories/Expense';
import { Expense } from '@/domain/Expenses';
import { Filters } from '@/domain/Filters';

export const getExpense = (expense_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyExpenses.base, queryKeyDefault.get, expense_id],
		enabled: !!expense_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!expense_id) return;
			return repository.getExpense(expense_id);
		},
	});

	return {
		...queryInfo,
		expense: queryInfo.data?.expense,
	};
};

export const getListExpenses = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyExpenses.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getListExpenses(filters);
		},
	});

	return {
		...queryInfo,
		expenses: queryInfo.data?.expenses,
	};
};

export const createExpense = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Expense>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateExpense = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Expense>) => {
			return repository.update(data);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createExpense(),
		update: updateExpense(),
	};

	return jsonType[type];
};