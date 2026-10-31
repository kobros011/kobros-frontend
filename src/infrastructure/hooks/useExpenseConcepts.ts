import { useEffect } from 'react';
import useExpensesConceptsStore from '../context/ConceptsStore';

export const useExpenseConcepts = () => {
	const { expensesConcepts, error, getExpensesConcepts, isError, isLoading } = useExpensesConceptsStore(state => state);
    

	useEffect(() => {
		if (isLoading != null) return;

		void getExpensesConcepts();
	}, [isLoading]);

	return {
		expensesConcepts,
		error,
		isLoading,
		isError,
	};
};