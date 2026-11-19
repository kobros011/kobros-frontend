import { ReactNode } from 'react';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import usePageTitle from '@/infrastructure/hooks/usePageTitle';
import { getModuleIcon } from './ModulesMenu/menuItems';
import PageTitle from './PageTitle';

interface FormHeaderOptions {
	/** Icono propio; por defecto, el del módulo en el menú. */
	icon?: ReactNode
	/** Falso si la pantalla no dibuja su propia tarjeta (no toca ni la barra ni la tarjeta). */
	enabled?: boolean
}

/**
 * Encabezado de un formulario (ver, editar, crear). En móvil el título va en la barra superior del layout, con el icono
 * del módulo, y el hook devuelve `undefined` para que la tarjeta no lo repita. En escritorio (o si la marca tiene logo y
 * la barra muestra el logo) devuelve el título con icono para el encabezado de la tarjeta.
 */
export const useFormHeader = (moduleKey: string, title: string, { icon, enabled = true }: FormHeaderOptions = {}): ReactNode => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const hasBrandLogo = useAppSettingsStore(state => !!(state.logoFullUrl || state.logoMarkUrl));
	const inLayout = enabled && isMobile && !hasBrandLogo;
	usePageTitle(inLayout ? title : undefined);

	if (!enabled || inLayout) return undefined;
	return <PageTitle icon={icon ?? getModuleIcon(moduleKey, 18)} title={title} />;
};

export default useFormHeader;
