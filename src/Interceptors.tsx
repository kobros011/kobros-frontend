import { useEffect } from 'react';
import useLoading from './infrastructure/hooks/useLoading';
import axios from 'axios';
import LoadingComponent from './UI/Components/LoadingComponent';
import useUserJWTStore from './infrastructure/context/User/UserDataJWTStore';

const urlApi = import.meta.env.VITE_URL_API;

export const RequestInterceptor = () => {
	const { accessToken, tokenType } = useUserJWTStore(state => state.jwt);
	const { isLoading, startLoading, stopLoading } = useLoading();

	useEffect(() => {
		const requestInterceptor = axios.interceptors.request.use(
			(config) => {
				startLoading();

				config.baseURL = urlApi;
				
				if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json';
				if (accessToken) {
					config.headers.Authorization = `${tokenType} ${accessToken}`;
					if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json';

				}
				stopLoading();
				return config;
			},
			(error) => {
				stopLoading();
				return Promise.reject(error);
			},
		);

		return () => {
			axios.interceptors.request.eject(requestInterceptor);
		};
	}, [accessToken]);

	if (isLoading) {
		return <LoadingComponent fullHeight label="Cargando" />;
	}
	
	return null;
};