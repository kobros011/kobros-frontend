import { getListPaymentsBasic } from '@/infrastructure/querys/Payment';
import { Row } from 'antd';
import { FC } from 'react';
import { ItemPaymentDetail } from './Item';

export const CardContentPayments: FC<{ loanId: string }> = ({ loanId }) => {

	const { payments } = getListPaymentsBasic(loanId);

	return (
		<Row gutter={[18, 12]} >
			{payments?.map(payment => (
				<ItemPaymentDetail key={payment.id} payment={payment} />
			))}
		</Row>
	);
};