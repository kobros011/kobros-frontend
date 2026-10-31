import { queryKeyExpensesConcepts, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { TypeAction } from '@/constants/types';
import { repository } from '../repositories/ExpenseConcept';
import { ExpensesConcepts } from '@/domain/ExpensesConcepts';

export const getExpenseConcept = (expenseConcept_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyExpensesConcepts.base, queryKeyDefault.get, expenseConcept_id],
		enabled: !!expenseConcept_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!expenseConcept_id) return;
			return repository.getExpenseConcept(expenseConcept_id);
		},
	});

	return {
		...queryInfo,
		expenseConcept: queryInfo.data?.data,
	};
};

export const getListExpensesConcepts = () => {
	const queryInfo = useQuery({
		queryKey: [queryKeyExpensesConcepts.base, queryKeyDefault.list],
		queryFn: () => {
			return repository.getListExpensesConcepts();
		},
	});

	return {
		...queryInfo,
		expensesConcepts: queryInfo.data?.expensesConcepts,
	};
};

export const createExpenseConcept = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<ExpensesConcepts>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateExpenseConcept = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<ExpensesConcepts>) => {
			return repository.update(data);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createExpenseConcept(),
		update: updateExpenseConcept(),
	};

	return jsonType[type];
};