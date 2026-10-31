import { FC, useState } from 'react';
import InputNumber from './InputNumber';
import { App, Button, Space } from 'antd';
import { usePayPayment } from '@/infrastructure/querys/Payment';
import { useQueryClient } from '@tanstack/react-query';
import { showLoadingNotification } from '../showLoadingNotification';
import { handleError } from '@/infrastructure/utils/handleError';
import { queryKeyPayments } from '@/constants/queryKeys';
import { Payment } from '@/domain/Payment';

export const PayPaymentField: FC<{ record: Payment }> = ({ record }) => {
	const [value, setValue] = useState<number>();
	const { notification } = App.useApp();

	const queryClient = useQueryClient();
    
	const payPaymentMutation = usePayPayment();
    
	const onPay = () => {
		if (!value || value == 0 ) {
			notification.warning({ message: 'El valor a aplicar debe ser diferente de 0' });
			return;
		}

		const notificationKey = showLoadingNotification({ notification, description: 'El pago esta siendo aplicado' });

		payPaymentMutation.mutate({
			paymentId: record.id,
			value: value ?? 0,
		}, {
			onSuccess: () => {
				setValue(0);
                
				void queryClient.refetchQueries({
					queryKey: [queryKeyPayments.base],
					exact: false,
				});
                
				notification.success({
					message: 'Pago aplicado exitosamente',
					key: notificationKey,
				});
			}, 
			onError: (error) => {
				const errorMessage = handleError(error, 'Ocurrió un error al aplicar el pago');
				notification.error({
					message: 'Error al realizar la acción',
					description: errorMessage,
					key: notificationKey,
				});
			},
		});
	};

	return (
		<Space.Compact style={{ width: '100%' }}>
			<InputNumber disabled={payPaymentMutation.isPending} value={value?.toString()} onChange={(valueNumber) => setValue(Number(valueNumber ?? 0))} style={{ width: '100%' }} thousandsSeparator placeholder="Ingresa un valor" />
			<Button loading={payPaymentMutation.isPending} type="primary" onClick={() => onPay()} ghost>Aplicar</Button>
		</Space.Compact>
	);
};