import { useCallback } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import useNavigationGuardStore from '@/infrastructure/context/NavigationGuardStore';

/**
 * Navega a una ruta; si hay un formulario con cambios sin guardar, antes pregunta si se quiere salir sin guardar.
 * Sin cambios navega directo (y en modo «ver» nunca pregunta).
 */
export const useGuardedNavigate = () => {
	const navigate = useNavigate();
	const { modal } = App.useApp();

	return useCallback((to: string) => {
		if (!useNavigationGuardStore.getState().dirty) {
			void navigate(to);
			return;
		}
		void modal.confirm({
			title: '¿Salir sin guardar?',
			content: 'Hiciste cambios que no se han guardado. Si sales ahora, se perderán.',
			okText: 'Salir sin guardar',
			cancelText: 'Seguir aquí',
			okButtonProps: { danger: true },
			// «Seguir aquí» es la opción por defecto (primaria, solo borde) y queda enfocada: salir es la acción que se elige a propósito.
			cancelButtonProps: { type: 'primary', ghost: true },
			autoFocusButton: 'cancel',
			centered: true,
			onOk: () => {
				useNavigationGuardStore.getState().setDirty(false);
				void navigate(to);
			},
		});
	}, [navigate, modal]);
};

export default useGuardedNavigate;
