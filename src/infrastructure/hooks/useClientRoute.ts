import { useEffect } from 'react';
import useClientRouteStore from '../context/ClientRouteStore';

export const useClientRoutes = (routeId?: string) => {
	const { clientRoutes, error, getClientRoutes, isError, isLoading } = useClientRouteStore(state => state);
	

	useEffect(() => {
		if (isLoading != null || !routeId) return;
		console.log(routeId);

		void getClientRoutes(routeId);
	}, [isLoading, routeId]);

	return {
		clientRoutes,
		getClientRoutes,
		error,
		isLoading,
		isError,
	};
};