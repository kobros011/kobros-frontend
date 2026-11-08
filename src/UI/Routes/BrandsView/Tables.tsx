import { MODULESNAME } from '@/constants/MODULESNAME';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getColumns } from './columns';
import { getPageBrands } from '@/infrastructure/querys/Brand';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { Brand } from '@/domain/Brand';

interface TableBrandsProps {
	isSearching: boolean
	actions: OnClickActions<Brand>
	type: 'active' | 'inactive'
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableBrands: FC<TableBrandsProps> = ({ isSearching, actions, type, setCount }) => {
	const moduleName = MODULESNAME.brands;
	const filters = filtersStore(state => state.filtersMap[moduleName]);

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters ?? {}));

	const { brands, total, isLoading, isRefetching, isFetching } = getPageBrands(
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
		<CustomTable<Brand>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={brands}
			columns={getColumns(actions)}
			moduleName={moduleName}
			titleField="name"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};