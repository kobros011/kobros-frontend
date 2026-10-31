import { useEffect } from 'react';
import useBrandStore from '../context/BrandsStore';
import useUserStore from '../context/User/UserDataStore';
import { TypeUser } from '@/constants/types';

export const useBrands = () => {
	const { typeUser } = useUserStore(state => state.user);
	const { brands, error, getBrands, isError, isLoading } = useBrandStore(state => state);
	

	useEffect(() => {
		if (isLoading != null) return;

		if (typeUser as string == TypeUser.dev as string) {
			void getBrands();
			return;
		}
	}, [isLoading]);

	return {
		brands,
		error,
		isLoading,
		isError,
	};
};