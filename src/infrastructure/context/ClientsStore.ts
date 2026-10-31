import { Client } from '@/domain/Client';
import { repository } from '@/infrastructure/repositories/Client';
import { create } from '../utils/storeCreate';

interface State {
	clients: Client[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getClients: (routeId?: string) => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getClients' | 'resetStore' > = {
	clients: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useClientStore = create<State>()(
	(set, get) => ({
		...initialState,
		getClients: async (routeId?: string) => {
			if (get().isLoading != null ) return;

			set({ isLoading: true });
			const response = await repository.getListClients({ active: true, ...(routeId ? { routeId: routeId } : {}) });
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar los clientes' });
				return;
			}
			set({ isLoading: false, clients: (response.clients ?? initialState.clients) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useClientStore;
