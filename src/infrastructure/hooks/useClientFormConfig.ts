import { createContext, useContext, useMemo } from 'react';
import type { Rule } from 'antd/es/form';
import { ClientFormConfig, ConfigurableClientField, ContactSectionKind, CustomFieldDef, DEFAULT_FORM_CONFIG } from '@/domain/Settings';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';

export interface ClientFormView {
	/** Un campo configurable se muestra en formularios, columnas y tarjetas. */
	isFieldVisible: (field: ConfigurableClientField) => boolean
	isFieldRequired: (field: ConfigurableClientField) => boolean
	/** Reglas de antd para un campo configurable (vacío si no es obligatorio). */
	rulesFor: (field: ConfigurableClientField, label?: string) => Rule[]
	isSectionVisible: (kind: ContactSectionKind) => boolean
	isSectionRequired: (kind: ContactSectionKind) => boolean
	/** Campos personalizados que se muestran y validan: no archivados y visibles. */
	activeCustomFields: CustomFieldDef[]
	/** Archivados: no se piden, pero sus valores guardados se muestran en edición (solo lectura). */
	archivedCustomFields: CustomFieldDef[]
	/** Campos personalizados que se pueden filtrar (activos y filtrables). */
	filterableCustomFields: CustomFieldDef[]
}

/** Vista de la configuración de Clientes con reglas listas para usar. Pura: se prueba sin React. */
export const buildClientFormView = (config: ClientFormConfig): ClientFormView => {
	const isFieldVisible = (field: ConfigurableClientField) => config.fields[field]?.visible ?? DEFAULT_FORM_CONFIG.clients.fields[field].visible;
	const isFieldRequired = (field: ConfigurableClientField) => {
		const setting = config.fields[field] ?? DEFAULT_FORM_CONFIG.clients.fields[field];
		return setting.visible && setting.required;
	};
	const isSectionVisible = (kind: ContactSectionKind) => config.sections[kind]?.visible ?? true;
	const isSectionRequired = (kind: ContactSectionKind) => {
		const setting = config.sections[kind];
		return !!setting && setting.visible && setting.required;
	};
	const activeCustomFields = config.custom.filter(item => !item.archived && item.visible);
	return {
		isFieldVisible,
		isFieldRequired,
		rulesFor: (field, label = field) => (isFieldRequired(field) ? [{ required: true, message: `El campo «${label}» es obligatorio` }] : []),
		isSectionVisible,
		isSectionRequired,
		activeCustomFields,
		archivedCustomFields: config.custom.filter(item => item.archived),
		filterableCustomFields: activeCustomFields.filter(item => item.filterable),
	};
};

/**
 * Configuración de la marca de un cliente concreto. El desarrollador no tiene marca propia (su configuración es la de
 * por defecto), así que el formulario de cliente la toma de la marca del cliente y la entrega por este contexto.
 */
export const ClientFormConfigContext = createContext<ClientFormView | null>(null);

/** Acceso a la configuración de Clientes desde cualquier formulario, columna, tarjeta o filtro. */
export const useClientFormConfig = (): ClientFormView => {
	const override = useContext(ClientFormConfigContext);
	const config = useAppSettingsStore(state => state.formConfig.clients);
	const own = useMemo(() => buildClientFormView(config), [config]);
	return override ?? own;
};

export default useClientFormConfig;
