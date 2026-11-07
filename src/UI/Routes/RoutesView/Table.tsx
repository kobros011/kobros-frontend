import { MODULESNAME } from '@/constants/MODULESNAME';
import { Route } from '@/domain/Route';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getListRoutes } from '@/infrastructure/querys/Route';
import { getColumns } from './columns';

interface TableRoutesProps {
	isSearching: boolean
	actions: OnClickActions<Route>
	type: 'active' | 'inactive'
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableRoutes: FC<TableRoutesProps> = ({ isSearching, actions, type, setCount }) => {
	const moduleName = MODULESNAME.routes;
	const filters = filtersStore(state => state.filtersMap[moduleName]);


	const { routes, isLoading, isRefetching, isFetching } = getListRoutes(
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
					active: routes?.length ?? 0,
				};
			}

			return {
				active: state.active,
				inactive: routes?.length ?? 0,
			};
		});
	}, [routes]);

	return (
		<CustomTable<Route>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={routes}
			columns={getColumns(actions)}
			moduleName={moduleName}
			titleField="name"
			onRowClick={actions.see}
		/>
	);
};