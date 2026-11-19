import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormInstance } from 'antd';
import useNavigationGuardStore from '../context/NavigationGuardStore';

const snapshot = (form: FormInstance) => JSON.stringify(form.getFieldsValue(true));

/**
 * Marca la pantalla como «con cambios sin guardar» mientras esté montada: el menú pide confirmación antes de salir y el
 * navegador antes de cerrar o recargar.
 *
 * - Formularios de Ant Design: `<Form {...bindForm(form)}>` y `markClean()` al guardar. Hay cambios cuando, después de la
 *   primera interacción real del usuario, los valores difieren de los que había en ese momento: así no cuentan los
 *   valores que los campos escriben solos al cargar (fecha por defecto, rutas…).
 * - Si la pantalla ya sabe si hay cambios, se pasa como `controlled` (`false` en modo solo lectura).
 */
export const useUnsavedChangesGuard = (controlled?: boolean) => {
	const [touched, setTouched] = useState(false);
	const baseline = useRef<string | null>(null);
	const dirty = controlled ?? touched;

	useEffect(() => {
		useNavigationGuardStore.getState().setDirty(dirty);
		return () => useNavigationGuardStore.getState().setDirty(false);
	}, [dirty]);

	useEffect(() => {
		if (!dirty) return undefined;
		const warn = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = '';
		};
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [dirty]);

	const markClean = useCallback(() => {
		baseline.current = null;
		setTouched(false);
	}, []);

	const bindForm = useCallback((form: FormInstance) => {
		const capture = () => {
			if (baseline.current === null) baseline.current = snapshot(form);
		};
		return {
			onPointerDownCapture: capture,
			onKeyDownCapture: capture,
			onValuesChange: () => {
				if (baseline.current === null) return;
				setTouched(snapshot(form) !== baseline.current);
			},
		};
	}, []);

	return { dirty, markClean, bindForm };
};

export default useUnsavedChangesGuard;
