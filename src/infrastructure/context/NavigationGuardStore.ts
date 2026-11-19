import { create } from '../utils/storeCreate';

interface State {
	/** Hay un formulario abierto con cambios sin guardar: salir de la pantalla debe pedir confirmación. */
	dirty: boolean
	setDirty: (dirty: boolean) => void
	resetStore: () => void
}

const useNavigationGuardStore = create<State>()((set) => ({
	dirty: false,
	setDirty: (dirty) => set({ dirty }),
	resetStore: () => set({ dirty: false }),
}));

export default useNavigationGuardStore;
