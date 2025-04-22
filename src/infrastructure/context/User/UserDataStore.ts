import { User } from '@domain/User';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
	user: User,
	setUser: (user: User) => void, 
	resetStore: () => void
}

const initialState: Pick<State, 'user' > = {
	user: {
		id: '',
		name: '',
		lastName: '',
		typeUser: '',
		username: '',
		active: false,
		createdAt: '',
		updatedAt: '',
	},
};

const useUserStore = create<State>()(persist(
	(set) => ({
		...initialState,
		setUser(user) {
			set({ user: user });
		},
		resetStore() {
			set({ ...initialState });
		},
	}), {
		name: 'user-data',
	},
));
export default useUserStore;
