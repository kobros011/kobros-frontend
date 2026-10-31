import { TypeUser } from '@/constants/types';
import { User } from '@/domain/User';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { getNameTypeUser } from '@/infrastructure/utils/getTypeUserText';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';

export const getColumns = (actions: OnClickActions<User>) => {

	const { columnActions } = useRowActions<User>(actions);

	const columns: CustomColumn<User>[] = [
		{
			key: 'fullName',
			title: 'Nombre completo',
			dataIndex: 'fullName',
			width: 200,
		},
		{
			key: 'typeUser',
			title: 'Tipo de usuario',
			dataIndex: 'typeUser',
			width: 120,
			render: (value: TypeUser) => {
				return getNameTypeUser(value);
			},
		},
		{
			key: 'active',
			title: 'Activo',
			dataIndex: 'active',
			width: 80,
			typeRender: 'boolean',
		},
		{
			key: 'createdAt',
			title: 'Fecha creación',
			dataIndex: 'createdAt',
			width: 120,
			typeRender: 'date',
		},
		{
			key: 'updatedAt',
			title: 'Fecha edición',
			dataIndex: 'updatedAt',
			width: 120,
			typeRender: 'date',
		},
		columnActions,
	];

	return BuildColumns(columns);
};