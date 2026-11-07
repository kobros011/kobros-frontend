import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'table' | 'list';

export interface FieldPref {
	key: string;
	visible: boolean;
}

export interface ModulePrefs {
	viewMode: ViewMode;
	tableFields: FieldPref[];
	cardFields: FieldPref[];
}

interface State {
	modules: Record<string, ModulePrefs>;
	setViewMode: (moduleName: string, mode: ViewMode) => void;
	setTableFields: (moduleName: string, fields: FieldPref[]) => void;
	setCardFields: (moduleName: string, fields: FieldPref[]) => void;
	resetStore: () => void;
}

const emptyPrefs = (current?: ModulePrefs): ModulePrefs => ({
	viewMode: current?.viewMode ?? 'table',
	tableFields: current?.tableFields ?? [],
	cardFields: current?.cardFields ?? [],
});

const useTableViewStore = create<State>()(persist(
	(set) => ({
		modules: {},
		setViewMode: (moduleName, mode) => set(state => ({
			modules: {
				...state.modules,
				[moduleName]: { ...emptyPrefs(state.modules[moduleName]), viewMode: mode },
			},
		})),
		setTableFields: (moduleName, fields) => set(state => ({
			modules: {
				...state.modules,
				[moduleName]: { ...emptyPrefs(state.modules[moduleName]), tableFields: fields },
			},
		})),
		setCardFields: (moduleName, fields) => set(state => ({
			modules: {
				...state.modules,
				[moduleName]: { ...emptyPrefs(state.modules[moduleName]), cardFields: fields },
			},
		})),
		resetStore: () => set({ modules: {} }),
	}),
	{
		name: 'table-view-prefs',
	},
));

export default useTableViewStore;
