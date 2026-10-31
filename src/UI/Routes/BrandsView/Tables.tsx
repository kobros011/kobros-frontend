import { MODULESNAME } from '@/constants/MODULESNAME';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getColumns } from './columns';
import { getListBrands } from '@/infrastructure/querys/Brand';
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

	const { brands, isLoading, isRefetching, isFetching } = getListBrands(
		{
			...filters,
			active: type == 'active' ? true : false,
		},
		isSearching,
	);

	useEffect(() => {
		setCount((state) => {
			if (type == 'active') {
				return {
					inactive: state.inactive,
					active: brands?.length ?? 0,
				};
			}

			return {
				active: state.active,
				inactive: brands?.length ?? 0,
			};
		});
	}, [brands]);

	return (
		<CustomTable<Brand>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={brands}
			columns={getColumns(actions)}
		/>
	);
};