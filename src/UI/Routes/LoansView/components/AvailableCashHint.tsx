import { FC } from 'react';
import { Alert, Typography } from 'antd';
import { getAvailableCash } from '@/infrastructure/querys/Loan';
import { formatRouteMoney } from '@/infrastructure/utils/money';

const { Text } = Typography;

export type CashHintKind = 'loan' | 'expense';

const COPY: Record<CashHintKind, { title: string, description: (missing: string) => string }> = {
	loan: {
		title: 'El capital supera el efectivo disponible en caja',
		description: missing => `Faltan ${missing}. Podrás crear el crédito, pero se te pedirá confirmarlo.`,
	},
	expense: {
		title: 'El gasto supera el efectivo disponible en caja',
		description: missing => `Faltan ${missing}. Podrás registrar el gasto, pero se te pedirá confirmarlo.`,
	},
};

interface AvailableCashHintProps {
	routeId?: string
	/** Valor digitado (capital del crédito o valor del gasto); vacío o 0 solo muestra el disponible. */
	amount: number
	/** Qué se está registrando; define los textos de la alerta. Por defecto, un crédito. */
	kind?: CashHintKind
}

/** Bajo el valor: cuánto efectivo hay disponible hoy en la ruta y, si el valor lo supera, la alerta antes de guardar. */
export const AvailableCashHint: FC<AvailableCashHintProps> = ({ routeId, amount, kind = 'loan' }) => {
	const { available } = getAvailableCash(routeId);
	if (available === undefined || !routeId) return null;

	const money = (value: number) => formatRouteMoney(value, routeId);
	const exceeds = amount > available;
	const copy = COPY[kind];
	return (
		<div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
			<Text type="secondary" style={{ fontSize: 12 }}>Disponible en caja hoy: <strong>{money(available)}</strong></Text>
			{exceeds && (
				<Alert
					type="warning"
					showIcon
					style={{ fontSize: 12 }}
					message={copy.title}
					description={copy.description(money(amount - available))}
				/>
			)}
		</div>
	);
};
