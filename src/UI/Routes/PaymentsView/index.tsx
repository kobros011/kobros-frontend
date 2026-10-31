import { Card } from 'antd';
import { FC } from 'react';
import { Layout } from './layout';


const PaymentsView: FC = () => {
	return (
		<Card
			style={{ maxHeight: '90vh' }}
		>
			<Layout />
		</Card>
	);
};

export default PaymentsView;