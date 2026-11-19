import { FC } from 'react';
import { Layout } from './layout';
import ResponsiveCard from '@/UI/Components/ResponsiveCard';


const PaymentsView: FC = () => {
	return (
		// En móvil `ResponsiveCard` quita la altura máxima para que la página fluya con su scroll.
		<ResponsiveCard
			style={{ maxHeight: '90vh' }}
		>
			<Layout />
		</ResponsiveCard>
	);
};

export default PaymentsView;
