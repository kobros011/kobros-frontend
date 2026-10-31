import { Payment } from '@/domain/Payment';
import CustomTable from '@/UI/Components/Table';
import { FC } from 'react';
import { getColumns } from './columns';
import { getListPayments } from '@/infrastructure/querys/Payment';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { MODULESNAME } from '@/constants/MODULESNAME';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';

interface TableBrandsProps {
	isSearching: boolean
}

export const TablePayments: FC<TableBrandsProps> = ({ isSearching }) => {
	const columns = getColumns();
	const { routes } = useRoutes();

	const currentDate = dayjs().startOf('date').format('YYYY-MM-DD');
	const filters = filtersStore(state => state.filtersMap[MODULESNAME.payments]);

	const { payments } = getListPayments({ payDate: currentDate, withPending: true, ...filters, routeId: routes.length > 1 ? filters?.routeId : routes?.map(item => item.id)?.[0] }, isSearching);

	return (
		<ConfigProvider
			theme={{
				components: {
					Table: {
						cellPaddingBlock: 0,
						cellPaddingInline: 0,
						cellPaddingInlineSM: 0,
						cellPaddingBlockMD: 0,
						cellPaddingBlockSM: 0,
						cellPaddingInlineMD: 0,
					},
					InputNumber: {
						fontSize: 13,
						borderRadius: 0,
						paddingInline: 5,
					},
					Space: {
						borderRadius: 0,
						paddingContentVertical: 0,
					},
					Button: {
						borderRadius: 0,
						padding: 0,
					},
				},
			}}
		>
			<CustomTable<Payment>
				columns={columns}
				dataSource={payments}
			/>
		</ConfigProvider>
	);
};