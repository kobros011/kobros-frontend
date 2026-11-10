import { FC } from 'react';
import { Alert, Typography } from 'antd';
import { getAvailableCash } from '@/infrastructure/querys/Loan';
import { useMoney } from '@/infrastructure/hooks/useMoney';

const { Text } = Typography;

interface AvailableCashHintProps {
	routeId?: string
	/** Capital digitado; vacío o 0 solo muestra el disponible. */
	capital: number
}

/** Bajo el capital: cuánto efectivo hay disponible hoy en la ruta y, si el capital lo supera, la alerta antes de guardar. */
export const AvailableCashHint: FC<AvailableCashHintProps> = ({ routeId, capital }) => {
	const money = useMoney();
	const { available } = getAvailableCash(routeId);
	if (available === undefined) return null;

	const exceeds = capital > available;
	return (
		<div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
			<Text type="secondary" style={{ fontSize: 12 }}>Disponible en caja hoy: <strong>{money(available)}</strong></Text>
			{exceeds && (
				<Alert
					type="warning"
					showIcon
					style={{ fontSize: 12 }}
					message="El capital supera el efectivo disponible en caja"
					description={`Faltan ${money(capital - available)}. Podrás crear el crédito, pero se te pedirá confirmarlo.`}
				/>
			)}
		</div>
	);
};
