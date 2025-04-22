import { useState } from 'react';

/**
 * Hook para gestionar un estado de carga.
 * @returns Objeto que contiene el estado de carga y funciones para iniciar y detener la carga.
*/
const useLoading = () => {
	const [isLoading, setIsLoading] = useState(false);

	const startLoading = () => setIsLoading(true);
	const stopLoading = () => setIsLoading(false);

	return { isLoading, startLoading, stopLoading };
};

export default useLoading;