import { FC, useState } from 'react';
import { App, Button, Space } from 'antd';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { usePayPayment } from '@/infrastructure/querys/Payment';
import { handleError } from '@/infrastructure/utils/handleError';
import { useMoney } from '@/infrastructure/hooks/useMoney';
import { PaymentHistoryItemDto } from '@/infrastructure/dto/PaymentHistoryDto';

/**
 * Abono inline de una cuota (solo si `can_pay`: vence hoy o está en mora).
 * El backend recibe el acumulado aplicado (`applied + monto`), igual que Cobro del día.
 */
export const QuotaPayInline: FC<{ item: PaymentHistoryItemDto; compact?: boolean }> = ({ item, compact = false }) => {
	const { notification } = App.useApp();
	const [amount, setAmount] = useState<number>();
	const payMutation = usePayPayment();
	const money = useMoney();

	if (!item.can_pay) return null;

	const submit = () => {
		if (!amount || amount <= 0) {
			notification.warning({ message: 'Ingresa un valor mayor a 0' });
			return;
		}
		payMutation.mutate({ paymentId: item.id, value: item.applied + amount }, {
			onSuccess: () => {
				setAmount(undefined);
				notification.success({ message: `Cuota ${item.quota_number}: abono aplicado` });
			},
			onError: error => notification.error({
				message: 'No se pudo aplicar el abono',
				description: handleError(error, 'Ocurrió un error al aplicar el abono'),
			}),
		});
	};

	return (
		<Space.Compact size="small" style={{ width: '100%', minWidth: compact ? 200 : undefined }}>
			<InputNumber
				aria-label={`Valor a abonar a la cuota ${item.quota_number}`}
				disabled={payMutation.isPending}
				value={amount?.toString()}
				onChange={value => setAmount(value ? Number(value) : undefined)}
				thousandsSeparator
				placeholder={`Saldo ${money(item.balance, { code: false })}`}
				style={{ width: '100%' }}
			/>
			<Button size="small" onClick={() => setAmount(item.balance)} disabled={payMutation.isPending} aria-label="Usar el saldo completo">
				Saldo
			</Button>
			<Button size="small" type="primary" loading={payMutation.isPending} onClick={submit}>
				Abonar
			</Button>
		</Space.Compact>
	);
};
