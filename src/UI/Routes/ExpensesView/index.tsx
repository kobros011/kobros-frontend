import { FC } from 'react';
import { Layout } from './layout';
import { Card } from 'antd';

const ExpensesView: FC = () => {
	return (
		<Card>
			<Layout />
		</Card>
	);
};

export default ExpensesView;