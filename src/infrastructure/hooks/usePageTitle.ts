import { useEffect } from 'react';
import usePageTitleStore from '../context/PageTitleStore';

/** Pone el título de la pantalla en la barra del layout (móvil) mientras la pantalla está montada; sin valor, no hace nada. */
export const usePageTitle = (title?: string) => {
	useEffect(() => {
		if (!title) return undefined;
		usePageTitleStore.getState().setTitle(title);
		return () => usePageTitleStore.getState().setTitle(undefined);
	}, [title]);
};

export default usePageTitle;
