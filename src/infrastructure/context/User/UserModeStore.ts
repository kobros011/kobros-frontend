import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum UserFontUse {
	DARK = 'dark',
	LIGHT = 'light',
	AUTO = 'auto',
}

interface State {
	darkMode: boolean,
	textColor: string,
	backgroundColor: string,
	userMode: UserFontUse,
	setColors: (textColor: string, backgroundColor: string) => void,
	setMode: (dark: boolean)=> void,
	setUserMode: (userMode: UserFontUse)=> void,
	resetStore: () => void
}

const initialState: Pick<State, 'darkMode' | 'userMode' | 'backgroundColor' | 'textColor' > = {
	darkMode: false,
	userMode: UserFontUse.AUTO,
	textColor: '',
	backgroundColor: '',
};

const useUserModeStore = create<State>()(persist(
	(set) => ({
		...initialState,
		setMode: (dark: boolean) => set(()=>{
			document.body.classList.toggle('dark', dark);
			return { darkMode: dark };
		}),
		setColors: (textColor: string, backgroundColor: string) => {
			set({
				textColor: textColor, backgroundColor: backgroundColor,
			});
		},
		setUserMode(userMode) {
			console.log(userMode);
			set({ userMode: userMode });
		},
		resetStore: () => {
			document.body.classList.toggle('dark', false);
			set({ ...initialState });
		},
	}), {
		name: 'user-mode',
	},
));

if (useUserModeStore.getState().darkMode) {
	document.body.classList.add('dark');
}

export default useUserModeStore;
