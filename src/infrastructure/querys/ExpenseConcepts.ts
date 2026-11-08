import { queryKeyExpensesConcepts, queryKeyDefault } from '@/constants/queryKeys';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TypeAction } from '@/constants/types';
import { repository } from '../repositories/ExpenseConcept';
import { ExpensesConcepts } from '@/domain/ExpensesConcepts';

export const getExpenseConcept = (expenseConcept_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyExpensesConcepts.base, queryKeyDefault.get, expenseConcept_id],
		enabled: !!expenseConcept_id,
		queryFn: () => {
			if (!expenseConcept_id) return;
			return repository.getExpenseConcept(expenseConcept_id);
		},
	});

	return {
		...queryInfo,
		expenseConcept: queryInfo.data?.expense,
	};
};

export const getListExpensesConcepts = (active?: boolean) => {
	const queryInfo = useQuery({
		queryKey: active === undefined
			? [queryKeyExpensesConcepts.base, queryKeyDefault.list]
			: [queryKeyExpensesConcepts.base, queryKeyDefault.list, active],
		queryFn: () => {
			return repository.getListExpensesConcepts(active);
		},
	});

	return {
		...queryInfo,
		expensesConcepts: queryInfo.data?.expensesConcepts,
	};
};

export const deleteExpenseConcept = () => {
	const mutation = useMutation({
		mutationFn: (concept_id: string) => {
			return repository.delete(concept_id);
		},
	});

	return mutation;
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