import { create } from '../utils/storeCreate';

export interface CurrencyInfo {
	code: string
	name: string
	symbol: string
	decimals: number
}

interface State {
	/** Catálogo ISO que sirve el servidor (código → datos). */
	catalog: Record<string, CurrencyInfo>
	/** Moneda de cada ruta visible, activa o no (id de ruta → código). */
	routeCurrency: Record<string, string>
	/** Sube cuando cambia algo de lo anterior: las pantallas se vuelven a pintar con la moneda correcta. */
	version: number
	setCatalog: (items: CurrencyInfo[]) => void
	setRouteCurrencies: (items: { id: string, currency: string }[]) => void
}

const useCurrencyStore = create<State>()((set) => ({
	catalog: {},
	routeCurrency: {},
	version: 0,
	setCatalog: (items) => set(state => ({ catalog: Object.fromEntries(items.map(item => [item.code, item])), version: state.version + 1 })),
	setRouteCurrencies: (items) => set(state => ({ routeCurrency: Object.fromEntries(items.map(item => [item.id, item.currency])), version: state.version + 1 })),
}));

export default useCurrencyStore;
