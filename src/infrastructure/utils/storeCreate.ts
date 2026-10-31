import type { StateCreator } from 'zustand';
import { create as actualCreate } from 'zustand';

const storeResetFns = new Set<() => void>();

export const resetAllStores = () => {
	storeResetFns.forEach((resetFn) => {
		resetFn();
	});
};

export const create = (<T extends { resetStore?: () => void }>() => {
	return (stateCreator: StateCreator<T>) => {
		const store = actualCreate(stateCreator);
		const currentState = store.getState();
		storeResetFns.add(() => {
			currentState?.resetStore?.();
		});
		return store;
	};
}) as typeof actualCreate;
