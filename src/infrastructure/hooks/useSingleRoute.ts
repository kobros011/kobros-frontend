import { useRoutes } from './useRoutes';

/** El usuario solo tiene una ruta: en la interfaz basta la prioridad, no hace falta decir el nombre de la ruta. */
export const useSingleRoute = () => {
	const { routes } = useRoutes();
	return routes.length === 1;
};
