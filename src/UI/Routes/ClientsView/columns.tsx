import { Client } from '@/domain/Client';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';
import { PriorityBadge, RouteChips } from './priority/PriorityChip';

export const getColumns = (actions: OnClickActions<Client>, routeId?: string) => {

	const { columnActions } = useRowActions<Client>(actions);

	const columns: CustomColumn<Client>[] = [
		// Con una ruta filtrada la lista viene ordenada por su prioridad: se muestra el número de esa ruta.
		...(routeId ? [{
			key: 'priority',
			title: '# Prior',
			dataIndex: 'routes',
			width: 80,
			render: (_value: unknown, record: Client) => {
				const route = record.routes?.find(item => item.routeId === routeId);
				return route ? <PriorityBadge order={route.order} size={30} /> : '—';
			},
		}] : []),
		{
			key: 'fullName',
			title: 'Nombre completo',
			dataIndex: 'fullName',
			width: 250,
		},
		{
			key: 'routes',
			title: 'Rutas y prioridad',
			dataIndex: 'routes',
			width: 260,
			render: (_value: unknown, record: Client) => <RouteChips routes={record.routes} />,
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
			key: 'beak',
			title: 'Saldo a favor',
			dataIndex: 'beak',
			width: 130,
			typeRender: 'money',
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