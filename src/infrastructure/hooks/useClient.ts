import { useEffect } from 'react';
import useClientStore from '../context/ClientsStore';

export const useClients = (routeId?: string) => {
	const { clients, error, getClients, isError, isLoading } = useClientStore(state => state);
	

	useEffect(() => {
		if (isLoading != null) return;

		void getClients(routeId);
	}, [isLoading]);

	return {
		clients,
		error,
		isLoading,
		isError,
	};
};