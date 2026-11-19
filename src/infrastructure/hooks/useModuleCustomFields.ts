import { useMemo } from 'react';
import { CustomFieldDef, CustomModule, CustomOnlyConfig } from '@/domain/Settings';
import { TypeUser } from '@/constants/types';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getSettings } from '@/infrastructure/querys/Settings';

/** Vista de los campos personalizados de un módulo (Créditos, Gastos o Rutas). */
export interface CustomFieldsView {
	/** Se muestran y validan: no archivados y visibles. */
	activeCustomFields: CustomFieldDef[]
	/** Archivados: no se piden, pero sus valores guardados se muestran (solo lectura). */
	archivedCustomFields: CustomFieldDef[]
	/** Activos y filtrables. */
	filterableCustomFields: CustomFieldDef[]
}

export const buildCustomFieldsView = (config: CustomOnlyConfig): CustomFieldsView => {
	const activeCustomFields = config.custom.filter(item => !item.archived && item.visible);
	return {
		activeCustomFields,
		archivedCustomFields: config.custom.filter(item => item.archived),
		filterableCustomFields: activeCustomFields.filter(item => item.filterable),
	};
};

/**
 * Campos personalizados de un módulo. El desarrollador no tiene marca propia: si pasa `brandId` (la de la ruta o el
 * registro que está viendo) se usa la configuración de esa marca; los demás usuarios usan la de su marca.
 */
export const useModuleCustomFields = (module: CustomModule, brandId?: string): CustomFieldsView => {
	const isDev = useUserStore(state => state.user.typeUser) == TypeUser.dev;
	const own = useAppSettingsStore(state => state.formConfig[module]);
	const { settings } = getSettings(brandId, isDev && !!brandId);
	return useMemo(
		() => buildCustomFieldsView(isDev && brandId && settings ? settings.formConfig[module] : own),
		[isDev, brandId, settings, own, module],
	);
};

export default useModuleCustomFields;
