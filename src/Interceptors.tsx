import { useEffect } from 'react';
import useLoading from './infrastructure/hooks/useLoading';
import axios, { AxiosError } from 'axios';
import LoadingComponent from './UI/Components/LoadingComponent';
import { useAuth } from '@clerk/clerk-react';

const urlApi = import.meta.env.VITE_URL_API;

if (!urlApi) {
	throw new Error('VITE_URL_API no está definida. Configura el .env del frontend.');
}

export const RequestInterceptor = () => {
	const { getToken, isSignedIn, signOut } = useAuth();
	const { isLoading, startLoading, stopLoading } = useLoading();

	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			async (config) => {
				startLoading();

				config.baseURL = urlApi;

				if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json';

				if (isSignedIn) {
					const token = await getToken();
					if (token) {
						config.headers.Authorization = `Bearer ${token}`;
					}
				}

				stopLoading();
				return config;
			},
			(error) => {
				stopLoading();
				return Promise.reject(error);
			},
		);

		const responseInterceptor = axios.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				if (error.response?.status === 401) {
					await signOut();
				}
				return Promise.reject(error);
			},
		);

		return () => {
			axios.interceptors.request.eject(requestInterceptor);
			axios.interceptors.response.eject(responseInterceptor);
		};
	}, [isSignedIn, getToken, signOut]);

	if (isLoading) {
		return <LoadingComponent fullHeight label="Cargando" />;
	}

	return null;
};
