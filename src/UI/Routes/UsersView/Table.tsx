import { MODULESNAME } from '@/constants/MODULESNAME';
import { User } from '@/domain/User';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { OnClickActions } from '@/UI/Components/RowActions';
import { getPageUsers } from '@/infrastructure/querys/User';
import { usePagination } from '@/infrastructure/hooks/usePagination';
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


	const text = filters?.text ?? '';
	const { page, pageSize, onChange, clampToTotal } = usePagination(text);

	const { users, total, isLoading, isRefetching, isFetching } = getPageUsers(
		{
			text,
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
		<CustomTable<User>
			isLoading={isFetching || isLoading || isRefetching}
			dataSource={users}
			columns={getColumns(actions)}
			moduleName={moduleName}
			titleField="fullName"
			onRowClick={actions.see}
			pagination={{ page, pageSize, total, onChange }}
		/>
	);
};