import { AxiosError } from 'axios';

export const handleError = (error: Error | AxiosError, message: string):string => {
	if (!error) return message;

	const axiosError = error as AxiosError;

	if (axiosError?.response?.status == 405) return 'Problemas internos del servidor';

	const getMessageError = () => {
		if (!axiosError?.response?.data) return message;

		const dataError = axiosError?.response?.data;
		if (dataError && typeof dataError === 'object') {
			if ('error' in dataError) return dataError.error as string;
			if ('detail' in dataError) return dataError.detail as string;
			if ('message' in dataError) return dataError.message as string;
		}
	
		return dataError as string;
	};


	return getMessageError();
};