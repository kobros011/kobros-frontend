import { useState } from 'react';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

/**
 * En móvil la barra de vista (selector Tabla/Lista + ajustes de `CustomTable`) se dibuja en la
 * misma fila que las tabs. Devuelve el contenido extra de la barra de tabs (el `div` destino) y,
 * para cada tab, el destino de `toolbarTarget`: solo la pestaña activa lo recibe, para que la
 * barra no se duplique (todas las pestañas están montadas con `forceRender`).
 * En escritorio no hay destino y la barra queda dentro de la tabla, como siempre.
 */
export const useTabsToolbar = (activeKey: string) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const [target, setTarget] = useState<HTMLDivElement | null>(null);

	const tabBarExtraContent = isMobile ? <div ref={setTarget} style={{ minWidth: 0 }} /> : undefined;
	const toolbarTargetFor = (key: string): HTMLElement | null | undefined => (isMobile && key === activeKey ? target : undefined);

	return { tabBarExtraContent, toolbarTargetFor };
};

export default useTabsToolbar;
