import { Route } from '@/domain/Route';
import { repository } from '@/infrastructure/repositories/Route';
import { create } from '../utils/storeCreate';

interface State {
	route: Route
	routes: Route[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getRoute: (route_id: string) => Promise<Route | undefined>,
	getRoutes: () => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getRoute' | 'getRoutes' | 'resetStore' > = {
	route: {
		id: '',
		name: '',
		allowedUsersIds: [],
		initialExpense: '',
		initialValue: '',
		openingDate: '',
		brandId: '',
		loansNumber: 1,
		active: false,
		createdAt: '',
		updatedAt: '',
	},
	routes: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useRouteStore = create<State>()(
	(set, get) => ({
		...initialState,
		getRoute: async (route_id: string) => {
			if (get().isLoading == true ) return;
			
			set({ isLoading: true });
			const response = await repository.getRoute(route_id);
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar la ruta' });
				return undefined;
			}
			set({ isLoading: false, route: (response.data ?? initialState.route) });
			return response.data;
		},
		getRoutes: async () => {
			if (get().isLoading != null ) return;

			set({ isLoading: true });
			const response = await repository.getList({ active: true });
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar las rutas' });
				return;
			}
			set({ isLoading: false, routes: (response.data ?? initialState.routes) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useRouteStore;
