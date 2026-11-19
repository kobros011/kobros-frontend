import { create } from '../utils/storeCreate';

interface State {
	/**
	 * Título de la pantalla actual para la barra superior del layout en móvil («Ver cliente», «Nuevo cliente»…).
	 * Si no hay, la barra muestra el nombre del módulo.
	 */
	title?: string
	setTitle: (title?: string) => void
	resetStore: () => void
}

const usePageTitleStore = create<State>()((set) => ({
	title: undefined,
	setTitle: (title) => set({ title }),
	resetStore: () => set({ title: undefined }),
}));

export default usePageTitleStore;
