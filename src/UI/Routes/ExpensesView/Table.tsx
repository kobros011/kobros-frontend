import { MODULESNAME } from '@/constants/MODULESNAME';
import { Expense } from '@/domain/Expenses';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { getPageExpenses } from '@/infrastructure/querys/Expense';
import { OnClickActions } from '@/UI/Components/RowActions';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { getColumns } from './columns';

interface TableExpensesProps {
	isSearching: boolean
	actions: OnClickActions<Expense>
	type: 'active' | 'inactive'
	setCount: React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableExpenses: FC<TableExpensesProps> = ({ isSearching, actions, type, setCount }) => {
	const moduleName = MODULESNAME.expenses;
	const filters = filtersStore(state => state.filtersMap[moduleName]) ?? {};

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters));

	const { expenses, total, isLoading, isRefetching, isFetching } = getPageExpenses(
		{
			...filters,
			active: type == 'active' ? true : false,
		},
		{ page, pageSize },
		isSearching,
	);

	useEffect(() => {
		setCount((state) => {
			if (type == 'active') {
				return {
					inactive: state.inactive,
					active: total,
				};
			}

			return {
				active: state.active,
				inactive: total,
			};
		});
	}, [total]);

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	return (
		<CustomTable<Expense>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={expenses}
			columns={getColumns(actions)}
			moduleName={moduleName}
			titleField="name"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};
