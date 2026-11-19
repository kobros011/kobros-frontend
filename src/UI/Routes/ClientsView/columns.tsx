import { Client } from '@/domain/Client';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';
import { PriorityBadge, RouteChips } from './priority/PriorityChip';
import type { ClientFormView } from '@/infrastructure/hooks/useClientFormConfig';
import { displayCustomValue } from './customFieldsPayload';

export const getColumns = (actions: OnClickActions<Client>, routeId?: string, selectedIds: ReadonlySet<string> = new Set(), formView?: ClientFormView) => {

	const { columnActions } = useRowActions<Client>(actions);

	const standard: CustomColumn<Client>[] = [
		// Con una ruta filtrada la lista viene ordenada por su prioridad: se muestra el número de esa ruta.
		...(routeId ? [{
			key: 'priority',
			title: '# Prior',
			dataIndex: 'routes',
			width: 80,
			render: (_value: unknown, record: Client) => {
				const route = record.routes?.find(item => item.routeId === routeId);
				return route ? <PriorityBadge order={route.order} size={30} state={selectedIds.has(record.id) ? 'moved' : 'default'} /> : '—';
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
			render: (_value: unknown, record: Client) => <RouteChips routes={record.routes} highlight={selectedIds.has(record.id)} />,
		},
		{
			key: 'idDocument',
			title: 'Documento',
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
	];

	// Campos estándar que la marca oculta no aparecen como columna.
	const hidden = new Set<string>();
	if (formView && !formView.isFieldVisible('neighborhood')) hidden.add('neighborhood');
	if (formView && !formView.isFieldVisible('current_phone')) hidden.add('currentPhone');

	// Campos personalizados activos: una columna por campo; "mostrar como columna" los deja visibles por defecto.
	const custom: CustomColumn<Client>[] = (formView?.activeCustomFields ?? []).map(field => ({
		key: `custom_${field.key}`,
		title: field.label,
		dataIndex: 'customFields',
		width: 140,
		render: (_value: unknown, record: Client) => displayCustomValue(record.customFields?.[field.key], field),
		defaultVisible: field.showInTable,
		cardDefaultVisible: field.showInCard,
	}));

	const columns: CustomColumn<Client>[] = [
		...standard.filter(column => !hidden.has(String(column.key))),
		...custom,
		columnActions,
	];

	return BuildColumns(columns);
};