import { MODULESNAME } from '@/constants/MODULESNAME';
import { Expense } from '@/domain/Expenses';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { getPageExpenses } from '@/infrastructure/querys/Expense';
import { OnClickActions } from '@/UI/Components/RowActions';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import useModuleCustomFields from '@/infrastructure/hooks/useModuleCustomFields';
import { customFiltersPayload } from '@/UI/Routes/ClientsView/customFieldsPayload';
import { getColumns } from './columns';

interface TableExpensesProps {
	isSearching: boolean
	actions: OnClickActions<Expense>
	type: 'active' | 'inactive'
	/** Dónde dibujar la barra de vista en móvil (ver `toolbarTarget` de CustomTable). */
	toolbarTarget?: HTMLElement | null
	setCount: React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableExpenses: FC<TableExpensesProps> = ({ isSearching, actions, type, setCount, toolbarTarget }) => {
	const customView = useModuleCustomFields('expenses');
	const moduleName = MODULESNAME.expenses;
	const filters = filtersStore(state => state.filtersMap[moduleName]) ?? {};

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters));

	const { expenses, total, isLoading, isRefetching, isFetching } = getPageExpenses(
		{
			...filters,
			active: type == 'active' ? true : false,
			customFilters: customFiltersPayload(filters.customFilters as Record<string, unknown> | undefined, customView.filterableCustomFields),
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
			columns={getColumns(actions, customView.activeCustomFields)}
			moduleName={moduleName}
			toolbarTarget={toolbarTarget}
			titleField="name"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};
