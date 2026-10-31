import { MODULESNAME } from '@/constants/MODULESNAME';
import { User } from '@/domain/User';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getListUsers } from '@/infrastructure/querys/User';
import { getColumns } from './columns';

interface TableUsersProps {
	isSearching: boolean
	actions: OnClickActions<User>
	type: 'active' | 'inactive'
	setCount:  React.Dispatch<React.SetStateAction<{
		active: number;
		inactive: number;
	}>>
}

export const TableUsers: FC<TableUsersProps> = ({ isSearching, actions, type, setCount }) => {
	const moduleName = MODULESNAME.users;
	const filters = filtersStore(state => state.filtersMap[moduleName]);


	const { users, isLoading, isRefetching, isFetching } = getListUsers(
		{
			text: filters?.text ?? '',
			active: type == 'active' ? true : false,
		},
		isSearching,
	);

	useEffect(() => {
		setCount((state) => {
			if (type == 'active') {
				return {
					inactive: state.inactive,
					active: users?.length ?? 0,
				};
			}

			return {
				active: state.active,
				inactive: users?.length ?? 0,
			};
		});
	}, [users]);

	return (
		<CustomTable<User>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={users}
			columns={getColumns(actions)}
		/>
	);
};