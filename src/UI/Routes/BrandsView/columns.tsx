import { Brand } from '@/domain/Brand';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';

export const getColumns = (actions: OnClickActions<Brand>) => {

	const { columnActions } = useRowActions<Brand>(actions);

	const columns: CustomColumn<Brand>[] = [
		{
			key: 'name',
			title: 'Nombre',
			dataIndex: 'name',
			width: 200,
		},
		{
			key: 'code',
			title: 'Código',
			dataIndex: 'code',
			width: 120,
		},
		{
			key: 'routesAvailable',
			title: 'No. rutas disponibles',
			dataIndex: 'routesAvailable',
			width: 100,
			typeRender: 'number',
			precision: 0,
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
			defaultVisible: false,
		},
		{
			key: 'updatedAt',
			title: 'Fecha edición',
			dataIndex: 'updatedAt',
			width: 120,
			typeRender: 'date',
			defaultVisible: false,
		},
		columnActions,
	];

	return BuildColumns(columns);
};