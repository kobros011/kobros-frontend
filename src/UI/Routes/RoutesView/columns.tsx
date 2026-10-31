import { Route } from '@/domain/Route';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';

export const getColumns = (actions: OnClickActions<Route>) => {

	const { columnActions } = useRowActions<Route>(actions);

	const columns: CustomColumn<Route>[] = [
		{
			key: 'name',
			title: 'Nombre',
			dataIndex: 'name',
			width: 200,
		},
		{
			key: 'initialValue',
			title: 'Valor Inicial',
			dataIndex: 'initialValue',
			width: 120,
			typeRender: 'money',
		},
		{
			key: 'initialExpense',
			title: 'Gatos Iniciales',
			dataIndex: 'initialExpense',
			width: 120,
			typeRender: 'money',
		},
		{
			key: 'openingDate',
			title: 'Fecha de apertura',
			dataIndex: 'openingDate',
			width: 120,
			typeRender: 'date',
		},
		{
			key: 'active',
			title: 'Activa',
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