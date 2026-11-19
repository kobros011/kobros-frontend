import { MODULESNAME } from '@/constants/MODULESNAME';
import { Route } from '@/domain/Route';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getPageRoutes } from '@/infrastructure/querys/Route';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import useModuleCustomFields from '@/infrastructure/hooks/useModuleCustomFields';
import { getColumns } from './columns';

interface TableRoutesProps {
	isSearching: boolean
	actions: OnClickActions<Route>
	type: 'active' | 'inactive'
	/** Dónde dibujar la barra de vista en móvil (ver `toolbarTarget` de CustomTable). */
	toolbarTarget?: HTMLElement | null
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableRoutes: FC<TableRoutesProps> = ({ isSearching, actions, type, setCount, toolbarTarget }) => {
	const customView = useModuleCustomFields('routes');
	const moduleName = MODULESNAME.routes;
	const filters = filtersStore(state => state.filtersMap[moduleName]);


	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters ?? {}));

	const { routes, total, isLoading, isRefetching, isFetching } = getPageRoutes(
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
		<CustomTable<Route>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={routes}
			columns={getColumns(actions, customView.activeCustomFields)}
			moduleName={moduleName}
			toolbarTarget={toolbarTarget}
			titleField="name"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};