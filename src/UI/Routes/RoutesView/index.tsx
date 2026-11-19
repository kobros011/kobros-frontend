import { FC } from 'react';
import { Layout } from './layout';
import ResponsiveCard from '@/UI/Components/ResponsiveCard';


const RoutesView: FC = () => {
	return (
		<ResponsiveCard>
			<Layout />
		</ResponsiveCard>
	);
};

export default RoutesView;
