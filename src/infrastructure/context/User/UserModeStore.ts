import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum UserFontUse {
	DARK = 'dark',
	LIGHT = 'light',
	AUTO = 'auto',
}

interface State {
	darkMode: boolean,
	isMobile: boolean,
	textColor: string,
	backgroundColor: string,
	userMode: UserFontUse,
	setColors: (textColor: string, backgroundColor: string) => void,
	setMode: (dark: boolean)=> void,
	setIsMobile: (isMobile: boolean)=> void,
	setUserMode: (userMode: UserFontUse)=> void,
	resetStore: () => void
}

const initialState: Pick<State, 'darkMode' | 'isMobile' | 'userMode' | 'backgroundColor' | 'textColor' > = {
	darkMode: false,
	isMobile: !window.matchMedia('(min-width: 768px)').matches,
	userMode: UserFontUse.AUTO,
	textColor: '',
	backgroundColor: '',
};

const useUserModeStore = create<State>()(persist(
	(set, get) => ({
		...initialState,
		setMode: (dark: boolean) => set(()=>{
			document.body.classList.toggle('dark', dark);
			return { darkMode: dark };
		}),
		setIsMobile: (isMobile: boolean) => {
			if (get().isMobile != isMobile) {
				set({ isMobile: isMobile });
			}
		},
		setColors: (textColor: string, backgroundColor: string) => {
			set({
				textColor: textColor, backgroundColor: backgroundColor,
			});
		},
		setUserMode(userMode) {
			set({ userMode: userMode });
		},
		resetStore: () => {
			document.body.classList.toggle('dark', false);
			set({ ...initialState });
		},
	}), {
		name: 'user-mode',
		partialize: (state) => ({
			darkMode: state.darkMode,
			userMode: state.userMode,
			textColor: state.textColor,
			backgroundColor: state.backgroundColor,
		}),
	},
));

if (useUserModeStore.getState().darkMode) {
	document.body.classList.add('dark');
}

export default useUserModeStore;
