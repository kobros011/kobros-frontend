import { ColumnType } from 'antd/es/table';
import { ReactNode } from 'react';
import { FieldPref } from '@/infrastructure/context/TableViewStore';

export interface FieldDef {
	key: string;
	title: string;
	dataIndex: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	render?: (value: any, record: any, index: number) => ReactNode;
	/** Si es false, el campo existe y es activable desde "Columnas"/"Tarjeta", pero no viene visible por defecto. */
	defaultVisible?: boolean;
}

export const DEFAULT_CARD_FIELDS_COUNT = 4;

/**
 * Catálogo de campos configurables a partir de las columnas ya construidas (post BuildColumns),
 * excluyendo la columna de acciones. Reutiliza el mismo `render` de la tabla para que la tarjeta
 * se vea exactamente igual que la celda (mismo formato de fecha, dinero, booleano, etc).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getConfigurableFields = (columns: ColumnType<any>[]): FieldDef[] => {
	return columns
		.filter(column => column.key !== 'actions' && Boolean(column.dataIndex))
		.map(column => ({
			key: String(column.key ?? column.dataIndex ?? ''),
			title: typeof column.title === 'string' ? column.title : String(column.key ?? ''),
			dataIndex: String(column.dataIndex ?? column.key ?? ''),
			render: column.render as FieldDef['render'],
			defaultVisible: (column as { defaultVisible?: boolean }).defaultVisible,
		}))
		.filter(field => field.key);
};

/**
 * Combina las preferencias guardadas (orden + visibilidad) con el catálogo real de campos.
 * Un campo nuevo en el código que aún no está en las preferencias se agrega al final;
 * un campo guardado que ya no existe en el código se descarta.
 */
export const mergeFieldPrefs = (
	fields: FieldDef[],
	stored: FieldPref[],
	defaultVisibleCount?: number,
): FieldPref[] => {
	const byKey = new Map(fields.map(field => [field.key, field]));
	const storedKeys = new Set(stored.map(pref => pref.key));

	const ordered: FieldPref[] = stored.filter(pref => byKey.has(pref.key));
	fields.forEach((field, index) => {
		if (!storedKeys.has(field.key)) {
			ordered.push({
				key: field.key,
				visible: defaultVisibleCount === undefined ? (field.defaultVisible ?? true) : index < defaultVisibleCount,
			});
		}
	});

	return ordered;
};
