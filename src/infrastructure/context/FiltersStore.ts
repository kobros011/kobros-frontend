import { MODULESNAME } from '@/constants/MODULESNAME';
import { Filters } from '@/domain/Filters';
import { persist } from 'zustand/middleware';
import { create } from '../utils/storeCreate';

interface FiltersState {
	filtersMap: Record<MODULESNAME, Partial<Filters> | undefined>;
	setFilters: (module: MODULESNAME, filters: Partial<Filters>) => void;
	resetStore: () => void
}

const initialValues =  {
	[MODULESNAME.brands]: undefined,
	[MODULESNAME.clients]: undefined,
	[MODULESNAME.routes]: undefined,
	[MODULESNAME.users]: undefined,
}; 

export const filtersStore = create<FiltersState>()(
	persist(
		(set) => ({
			filtersMap: initialValues,
			setFilters: (module, filters) => {
				set(state => ({
					filtersMap: {
						...state.filtersMap,
						[module]: filters,
					},
				}));
			},
			resetStore() {
				set({ filtersMap: initialValues });
			},
		}),
		{
			name: 'filters',
			partialize: state => ({
				filtersMap: state.filtersMap,
			}),
		},

	),
);