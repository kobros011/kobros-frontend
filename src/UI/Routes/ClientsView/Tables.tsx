import { MODULESNAME } from '@/constants/MODULESNAME';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getColumns } from './columns';
import { getListClients } from '@/infrastructure/querys/Client';
import { Client } from '@/domain/Client';

interface TableClientsProps {
	isSearching: boolean
	actions: OnClickActions<Client>
	type: 'active' | 'inactive'
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableClients: FC<TableClientsProps> = ({ isSearching, actions, type, setCount }) => {
	const moduleName = MODULESNAME.clients;
	const filters = filtersStore(state => state.filtersMap[moduleName]);

	const { clients, isLoading, isRefetching, isFetching } = getListClients(
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
					active: clients?.length ?? 0,
				};
			}

			return {
				active: state.active,
				inactive: clients?.length ?? 0,
			};
		});
	}, [clients]);

	return (
		<CustomTable<Client>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={clients}
			columns={getColumns(actions)}
		/>
	);
};