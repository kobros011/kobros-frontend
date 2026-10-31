import { Brand } from '@/domain/Brand';
import { repository } from '@/infrastructure/repositories/Brand';
import { create } from '../utils/storeCreate';

interface State {
	brand: Brand
	brands: Brand[],
	isLoading: boolean | null,
	error: string | null,
	isError: boolean,
	getBrand: (brand_id: string) => Promise<void>,
	getBrands: () => Promise<void>,
	resetStore: () => void
}

const initialState: Omit<State, 'getBrand' | 'getBrands' | 'resetStore' > = {
	brand: {
		id: '',
		name: '',
		code: '',
		routesAvailable: 0,
		active: false,
		createdAt: '',
		updatedAt: '',
	},
	brands: [],
	error: '',
	isError: false,
	isLoading: null,
};

const useBrandStore = create<State>()(
	(set, get) => ({
		...initialState,
		getBrand: async (brand_id: string) => {
			if (get().isLoading != null ) return;

			set({ isLoading: true });
			const response = await repository.getBrand(brand_id);
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar la marca' });
				return;
			}
			set({ isLoading: false, brand: (response.data ?? initialState.brand) });
		},
		getBrands: async () => {
			if (get().isLoading != null ) return;

			set({ isLoading: true });
			const response = await repository.getListBrands({ active: true });
			if (response.status != 200) {
				set({ isLoading: false, isError: true, error: 'Error al cargar la marcas' });
				return;
			}
			set({ isLoading: false, brands: (response.brands ?? initialState.brands) });
		},
		resetStore() {
			set({ ...initialState });
		},
	}),
);
export default useBrandStore;
