import { MODULESNAME } from '@/constants/MODULESNAME';
import { Expense } from '@/domain/Expenses';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { getListExpenses } from '@/infrastructure/querys/Expense';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { getColumns } from './columns';

interface TableExpensesProps {
	isSearching: boolean
	setCount: React.Dispatch<React.SetStateAction<{
		active: number;
	}>>
}

export const TableExpenses: FC<TableExpensesProps> = ({ isSearching, setCount }) => {
	const moduleName = MODULESNAME.expenses;
	const filters = filtersStore(state => state.filtersMap[moduleName]) ?? {};

	const { expenses, isLoading, isRefetching, isFetching } = getListExpenses(filters, isSearching);

	useEffect(() => {
		setCount({ active: expenses?.length ?? 0 });
	}, [expenses]);

	return (
		<CustomTable<Expense>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={expenses}
			columns={getColumns()}
		/>
	);
};