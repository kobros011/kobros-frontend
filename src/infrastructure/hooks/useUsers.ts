import { useEffect } from 'react';
import { TypeUser } from '@/constants/types';
import useUsersStore from '../context/UsersStore';
import useUserStore from '../context/User/UserDataStore';

export const useUsers = () => {
	const { typeUser } = useUserStore(state => state.user);
	const { users, error, getUsers, isError, isLoading } = useUsersStore(state => state);

	useEffect(() => {
		if (isLoading != null) return;

		if ([TypeUser.super, TypeUser.dev].includes(typeUser)) {
			void getUsers();
			return;
		}
	}, [isLoading]);

	return {
		users,
		error,
		isLoading,
		isError,
	};
};