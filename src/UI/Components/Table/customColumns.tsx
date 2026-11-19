import type { CustomFieldDef } from '@/domain/Settings';
import type { CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { displayCustomValue } from '@/UI/Routes/ClientsView/customFieldsPayload';

/**
 * Una columna por campo personalizado activo de un módulo. `showInTable` los deja visibles por defecto en la tabla y
 * `showInCard` en la vista de tarjetas. Los registros guardan los valores en `customFields`.
 */
export const customColumns = <T extends { customFields?: Record<string, unknown> }>(fields: CustomFieldDef[]): CustomColumn<T>[] =>
	fields.map(field => ({
		key: `custom_${field.key}`,
		title: field.label,
		dataIndex: 'customFields',
		width: 140,
		render: (_value: unknown, record: T) => displayCustomValue(record.customFields?.[field.key], field),
		defaultVisible: field.showInTable,
		cardDefaultVisible: field.showInCard,
	}));
