export type NumberFormatStyle = 'comma-thousands' | 'dot-thousands';
export type LogoTone = 'dark' | 'light' | 'mixed' | null;
export type LogoVariant = 'full' | 'mark';

// ---- Configuración de formularios por marca (módulo Clientes). Contrato: kobros-backend/docs/contrato-configuracion-formularios.md
export type CustomFieldType = 'text' | 'number' | 'money' | 'email' | 'phone' | 'date' | 'select' | 'boolean';
export type ConfigurableClientField = 'current_phone' | 'neighborhood' | 'linking_date';
export type ContactSectionKind = 'fiador' | 'referencia';

export interface FieldSetting {
	required: boolean
	visible: boolean
}

export interface CustomFieldDef {
	key: string
	label: string
	type: CustomFieldType
	required: boolean
	visible: boolean
	archived: boolean
	options: string[]
	showInTable: boolean
	showInCard: boolean
	filterable: boolean
}

export interface ClientFormConfig {
	fields: Record<ConfigurableClientField, FieldSetting>
	sections: Record<ContactSectionKind, FieldSetting>
	custom: CustomFieldDef[]
}

/** Créditos, Gastos y Rutas solo tienen campos personalizados (sus campos estándar no son configurables). */
export interface CustomOnlyConfig {
	custom: CustomFieldDef[]
}

export type CustomModule = 'loans' | 'expenses' | 'routes';
export type FormModule = 'clients' | CustomModule;

export interface FormConfig {
	version: number
	clients: ClientFormConfig
	loans: CustomOnlyConfig
	expenses: CustomOnlyConfig
	routes: CustomOnlyConfig
}

export const CONFIGURABLE_CLIENT_FIELDS: Record<ConfigurableClientField, string> = {
	current_phone: 'Teléfono',
	neighborhood: 'Barrio',
	linking_date: 'Fecha de vinculación',
};

export const CONTACT_SECTION_LABELS: Record<ContactSectionKind, string> = { fiador: 'Fiadores', referencia: 'Referencias' };

/** Configuración que equivale al comportamiento actual de la app (sin cambios hasta que la marca la edite). */
export const DEFAULT_FORM_CONFIG: FormConfig = {
	version: 0,
	clients: {
		fields: {
			current_phone: { required: false, visible: true },
			neighborhood: { required: false, visible: true },
			linking_date: { required: true, visible: true },
		},
		sections: {
			fiador: { required: false, visible: true },
			referencia: { required: false, visible: true },
		},
		custom: [],
	},
	loans: { custom: [] },
	expenses: { custom: [] },
	routes: { custom: [] },
};

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
	/** Configuración de formularios de la marca; sin cargar, los valores por defecto. */
	formConfig: FormConfig
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
	formConfig: DEFAULT_FORM_CONFIG,
};
