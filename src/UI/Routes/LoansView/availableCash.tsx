import { HookAPI } from 'antd/es/modal/useModal';
import { repository } from '@/infrastructure/repositories/Loan';
import { formatRouteMoney } from '@/infrastructure/utils/money';

export type CashConfirmKind = 'loan' | 'expense';

/**
 * Antes de guardar un crédito (o un gasto): si su valor supera el efectivo disponible hoy en la ruta, pide confirmación.
 * Resuelve `true` para seguir (alcanza, no se pudo consultar o el usuario confirma) y `false` si cancela.
 */
export const confirmWithinAvailableCash = async (
	modal: HookAPI,
	routeId: string | undefined,
	amount: number,
	kind: CashConfirmKind = 'loan',
): Promise<boolean> => {
	if (!routeId || !(amount > 0)) return true;
	let available: number;
	try {
		available = await repository.availableCash(routeId);
	} catch {
		return true; // el aviso es informativo: si no se puede consultar, no impide guardar
	}
	if (amount <= available) return true;

	const money = (value: number) => formatRouteMoney(value, routeId);
	const isExpense = kind === 'expense';
	return new Promise<boolean>(resolve => {
		void modal.confirm({
			title: isExpense ? 'El gasto supera el efectivo disponible en caja' : 'El capital supera el efectivo disponible en caja',
			content: isExpense
				? `Disponible hoy en la ruta: ${money(available)}. Valor del gasto: ${money(amount)} (faltan ${money(amount - available)}). ¿Registrar el gasto de todos modos?`
				: `Disponible hoy en la ruta: ${money(available)}. Capital del crédito: ${money(amount)} (faltan ${money(amount - available)}). ¿Crear el crédito de todos modos?`,
			okText: isExpense ? 'Registrar gasto' : 'Crear crédito',
			cancelText: 'Cancelar',
			cancelButtonProps: { danger: true },
			onOk: () => resolve(true),
			onCancel: () => resolve(false),
		});
	});
};
