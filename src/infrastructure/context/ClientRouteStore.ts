import { ClientRoute } from '@/domain/ClientRoute';
import { create } from '../utils/storeCreate';
import { repository } from '../repositories/ClientRoute';

interface State {
	clientRoutes: ClientRoute[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getClientRoutes: (routeId?: string) => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getClientRoutes' | 'resetStore' > = {
	clientRoutes: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useClientRouteStore = create<State>()(
	(set) => ({
		...initialState,
		getClientRoutes: async (routeId?: string) => {
			set({ isLoading: true });
			const response = await repository.getListClientRoutes(routeId ?? '');
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar los clientRoutes' });
				return;
			}
			set({ isLoading: false, clientRoutes: (response.clientRoutes ?? initialState.clientRoutes) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useClientRouteStore;
