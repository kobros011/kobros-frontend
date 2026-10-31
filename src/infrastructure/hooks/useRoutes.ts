import { useEffect } from 'react';
import useRouteStore from '../context/RoutesStore';

export const useRoutes = () => {
	const { routes, error, getRoutes, isError, isLoading, route } = useRouteStore(state => state);

	useEffect(() => {
		if (isLoading != null) return;

		void getRoutes();
	}, [isLoading]);

	return {
		route,
		routes,
		error,
		isLoading,
		isError,
	};
};