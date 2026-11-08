import { create } from '@/infrastructure/utils/storeCreate';
import { LogoTone, NumberFormatStyle, Settings } from '@/domain/Settings';

interface State {
	appName: string
	primaryColor: string | null
	logoFullUrl: string | null
	logoFullWidth: number | null
	logoFullHeight: number | null
	logoFullTone: LogoTone
	logoMarkUrl: string | null
	logoMarkWidth: number | null
	logoMarkHeight: number | null
	logoMarkTone: LogoTone
	numberFormatStyle: NumberFormatStyle
	numberDecimals: 0 | 2
	/** Monedas de la marca (códigos ISO); la primera es la principal. Sin moneda por defecto: vacío hasta que cargan los ajustes. */
	currencies: string[]
	/** true una vez que se resolvió (con éxito o error) la configuración de la marca. */
	loaded: boolean
	apply: (settings: Settings) => void
	markLoaded: () => void
	resetStore: () => void
}

const PRIMARY_CACHE_KEY = 'kobros:primary-color';

/** Último color de marca conocido: así los spinners y pantallas de carga ya salen con el color de la marca antes de que lleguen los ajustes. */
const readCachedPrimary = (): string | null => {
	try {
		return localStorage.getItem(PRIMARY_CACHE_KEY);
	} catch {
		return null;
	}
};

const writeCachedPrimary = (color: string | null) => {
	try {
		if (color) localStorage.setItem(PRIMARY_CACHE_KEY, color);
		else localStorage.removeItem(PRIMARY_CACHE_KEY);
	} catch {
		// sin almacenamiento disponible (modo privado): se usa el verde por defecto hasta que cargue la marca
	}
};

const initialState: Omit<State, 'apply' | 'markLoaded' | 'resetStore'> = {
	appName: '',
	primaryColor: readCachedPrimary(),
	logoFullUrl: null,
	logoFullWidth: null,
	logoFullHeight: null,
	logoFullTone: null,
	logoMarkUrl: null,
	logoMarkWidth: null,
	logoMarkHeight: null,
	logoMarkTone: null,
	numberFormatStyle: 'comma-thousands',
	numberDecimals: 2,
	currencies: [],
	loaded: false,
};

/** Configuración de marca aplicada a toda la app (white label + formato de números). */
const useAppSettingsStore = create<State>()((set) => ({
	...initialState,
	apply: (settings) => {
		writeCachedPrimary(settings.primaryColor);
		set({
			appName: settings.appName,
			primaryColor: settings.primaryColor,
			logoFullUrl: settings.logoFullUrl,
			logoFullWidth: settings.logoFullWidth,
			logoFullHeight: settings.logoFullHeight,
			logoFullTone: settings.logoFullTone,
			logoMarkUrl: settings.logoMarkUrl,
			logoMarkWidth: settings.logoMarkWidth,
			logoMarkHeight: settings.logoMarkHeight,
			logoMarkTone: settings.logoMarkTone,
			numberFormatStyle: settings.numberFormatStyle,
			numberDecimals: settings.numberDecimals,
			currencies: settings.currencies,
			loaded: true,
		});
	},
	markLoaded: () => set({ loaded: true }),
	resetStore: () => set({ ...initialState }),
}));

export default useAppSettingsStore;
