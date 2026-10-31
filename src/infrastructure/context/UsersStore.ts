import { User } from '@/domain/User';
import { repository } from '@/infrastructure/repositories/User';
import { create } from '../utils/storeCreate';

interface State {
	users: User[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getUsers: () => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getUsers' | 'resetStore'> = {
	users: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useUsersStore = create<State>()(
	(set, get) => ({
		...initialState,
		getUsers: async () => {
			if (get().isLoading != null) return;

			set({ isLoading: true });
			const response = await repository.getList({ active: true });
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar la marcas' });
				return;
			}
			set({ isLoading: false, users: (response.data ?? initialState.users) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useUsersStore;
