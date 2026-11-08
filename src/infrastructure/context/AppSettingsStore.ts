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
	/** true una vez que se resolvió (con éxito o error) la configuración de la marca. */
	loaded: boolean
	apply: (settings: Settings) => void
	markLoaded: () => void
	resetStore: () => void
}

const initialState: Omit<State, 'apply' | 'markLoaded' | 'resetStore'> = {
	appName: '',
	primaryColor: null,
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
	loaded: false,
};

/** Configuración de marca aplicada a toda la app (white label + formato de números). */
const useAppSettingsStore = create<State>()((set) => ({
	...initialState,
	apply: (settings) => set({
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
		loaded: true,
	}),
	markLoaded: () => set({ loaded: true }),
	resetStore: () => set({ ...initialState }),
}));

export default useAppSettingsStore;
