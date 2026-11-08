export type NumberFormatStyle = 'comma-thousands' | 'dot-thousands';
export type LogoTone = 'dark' | 'light' | 'mixed' | null;
export type LogoVariant = 'full' | 'mark';

export interface Settings {
	brandId: string | null
	brandName: string
	brandCode: string
	contactEmail: string
	contactPhone: string
	appName: string
	primaryColor: string | null
	// Logo del menú expandido / login.
	logoFullUrl: string | null
	logoFullWidth: number | null
	logoFullHeight: number | null
	logoFullTone: LogoTone
	// Logo (o ícono) del menú colapsado — independiente del anterior.
	logoMarkUrl: string | null
	logoMarkWidth: number | null
	logoMarkHeight: number | null
	logoMarkTone: LogoTone
	numberFormatStyle: NumberFormatStyle
	numberDecimals: 0 | 2
	/** Códigos ISO de las monedas de la marca; la primera es la principal. Vacío = sin configurar. */
	currencies: string[]
	logoEnabled: boolean
}

export type SettingsForm = Pick<Settings, 'brandName' | 'brandCode' | 'contactEmail' | 'contactPhone' | 'appName' | 'primaryColor' | 'numberFormatStyle' | 'numberDecimals' | 'currencies'>;

export const DEFAULT_APP_NAME = 'Kobros';

export const DEFAULT_SETTINGS: Settings = {
	brandId: null,
	brandName: '',
	brandCode: '',
	contactEmail: '',
	contactPhone: '',
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
	currencies: [],
	logoEnabled: false,
};
