import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { repository } from '@/infrastructure/repositories/ExpenseConcept';
import { create } from '../utils/storeCreate';

interface State {
	expensesConcepts: ExpensesConcepts[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getExpensesConcepts: () => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getExpensesConcepts' | 'resetStore' > = {
	expensesConcepts: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useExpensesConceptsStore = create<State>()(
	(set, get) => ({
		...initialState,
		getExpensesConcepts: async () => {
			if (get().isLoading != null ) return;

			set({ isLoading: true });
			const response = await repository.getListExpensesConcepts();
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar los clientes' });
				return;
			}
			set({ isLoading: false, expensesConcepts: (response.expensesConcepts ?? initialState.expensesConcepts) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useExpensesConceptsStore;
