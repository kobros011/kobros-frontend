import { create } from '../utils/storeCreate';

interface State {
	/**
	 * Marca que el desarrollador está configurando. Se elige en «General» y la usan también «Campos obligatorios» y
	 * «Campos personalizados»; mientras no haya una, esas dos secciones quedan deshabilitadas. Los demás perfiles
	 * configuran su propia marca y no usan este valor.
	 */
	brandId?: string
	setBrandId: (brandId?: string) => void
	resetStore: () => void
}

const useSettingsBrandStore = create<State>()((set) => ({
	brandId: undefined,
	setBrandId: (brandId) => set({ brandId }),
	resetStore: () => set({ brandId: undefined }),
}));

export default useSettingsBrandStore;
