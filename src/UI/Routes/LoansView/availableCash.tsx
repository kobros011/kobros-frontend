import { HookAPI } from 'antd/es/modal/useModal';
import { repository } from '@/infrastructure/repositories/Loan';
import { formatRouteMoney } from '@/infrastructure/utils/money';

/**
 * Antes de guardar un crédito: si su capital supera el efectivo disponible hoy en la ruta, pide confirmación.
 * Resuelve `true` para seguir (alcanza, no se pudo consultar o el usuario confirma) y `false` si cancela.
 */
export const confirmWithinAvailableCash = async (
	modal: HookAPI,
	routeId: string | undefined,
	capital: number,
): Promise<boolean> => {
	if (!routeId || !(capital > 0)) return true;
	let available: number;
	try {
		available = await repository.availableCash(routeId);
	} catch {
		return true; // el aviso es informativo: si no se puede consultar, no impide guardar
	}
	if (capital <= available) return true;

	const money = (value: number) => formatRouteMoney(value, routeId);
	return new Promise<boolean>(resolve => {
		void modal.confirm({
			title: 'El capital supera el efectivo disponible en caja',
			content: `Disponible hoy en la ruta: ${money(available)}. Capital del crédito: ${money(capital)} (faltan ${money(capital - available)}). ¿Crear el crédito de todos modos?`,
			okText: 'Crear crédito',
			cancelText: 'Cancelar',
			cancelButtonProps: { danger: true },
			onOk: () => resolve(true),
			onCancel: () => resolve(false),
		});
	});
};
