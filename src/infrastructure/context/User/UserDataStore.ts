import { TypeUser } from '@/constants/types';
import { create } from '@/infrastructure/utils/storeCreate';
import { User } from '@domain/User';
import { persist } from 'zustand/middleware';

interface State {
	user: User,
	setUser: (user: User) => void, 
	resetStore: () => void
}

const initialState: Pick<State, 'user' > = {
	user: {
		id: '',
		fullName: '',
		documentId: '',
		linkingDate: '',
		address: '',
		city: '',
		department: '',
		mobile: '',
		password: '',
		phone: '',
		typeUser: TypeUser.super,
		username: '',
		brandId: '',
		active: false,
		createdAt: '',
		updatedAt: '',
	},
};

const useUserStore = create<State>()(persist(
	(set) => ({
		...initialState,
		setUser(user) {
			set({ user: { ...user, password: '' } });
		},
		resetStore() {
			set({ ...initialState });
		},
	}), {
		name: 'user-data',
		partialize: (state) => ({
			user: { ...state.user, password: '' },
		}),
	},
));
export default useUserStore;
