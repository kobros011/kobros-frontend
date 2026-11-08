import { Client } from '@/domain/Client';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';

export const getColumns = (actions: OnClickActions<Client>) => {

	const { columnActions } = useRowActions<Client>(actions);

	const columns: CustomColumn<Client>[] = [
		{
			key: 'fullName',
			title: 'Nombre completo',
			dataIndex: 'fullName',
			width: 250,
		},
		{
			key: 'idDocument',
			title: 'Documento (Cédula, DNI)',
			dataIndex: 'idDocument',
			width: 200,
		},
		{
			key: 'currentAddress',
			title: 'Dirección actual',
			dataIndex: 'currentAddress',
			width: 120,
			typeRender: 'largeText',
		},
		{
			key: 'neighborhood',
			title: 'Barrio',
			dataIndex: 'neighborhood',
			width: 120,
			typeRender: 'largeText',
		},
		{
			key: 'currentPhone',
			title: 'Teléfono actual',
			dataIndex: 'currentPhone',
			width: 120,
			defaultVisible: false,
		},
		{
			key: 'currentMobile',
			title: 'Celular actual',
			dataIndex: 'currentMobile',
			width: 120,
		},
		{
			key: 'linkingDate',
			title: 'Fecha vinculación',
			dataIndex: 'linkingDate',
			width: 120,
			typeRender: 'date',
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