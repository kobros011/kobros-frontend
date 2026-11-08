import { TableProps } from 'antd';
import { ReactNode } from 'react';

export interface IRecord {
	id?: string | number | null;
	name?: string | null | undefined;
	isHovered?: boolean;
	active?: boolean;
}

/** Paginación controlada por el servidor, compartida por la vista de tabla y la de tarjetas. */
export interface ServerPagination {
	page: number;
	pageSize: number;
	total: number;
	onChange: (page: number, pageSize: number) => void;
}

export interface PropsTables<
	RecordType extends IRecord = IRecord,
> extends Pick<TableProps<RecordType>, 'columns' | 'dataSource' | 'loading' | 'sticky' | 'rowClassName' | 'onRow'> {
	scrollX?: number | true | string | undefined,
	scrollY?: number | string | undefined,
	isLoading?: boolean
	readonly?: boolean
	/** Nombre único del módulo (ej. MODULESNAME.users). Al pasarlo se habilita el selector Tabla/Lista con columnas y tarjeta configurables. */
	moduleName?: string
	/** Campo mostrado como título de la tarjeta en vista de lista. */
	titleField?: keyof RecordType
	/** Abre el detalle del registro (ej. actions.see). Si se provee, la tarjeta completa queda clicable en vista de lista. */
	onRowClick?: (record: RecordType) => void
	/** Píldora del pie de la tarjeta en vista de lista (ej. conteo de créditos). Solo se pasa cuando el módulo tiene un dato real que mostrar. */
	cardFooterBadge?: (record: RecordType) => ReactNode
	/** Paginación del servidor. Sin ella la tabla no pagina y la vista de tarjetas pagina en el cliente. */
	pagination?: ServerPagination
	/** Selección múltiple (casillas en la tabla y en las tarjetas). `keys` son los id seleccionados, incluso de otras páginas. */
	selection?: ServerSelection<RecordType>
}

export interface ServerSelection<RecordType> {
	keys: string[]
	onToggle: (record: RecordType, checked: boolean) => void
	onToggleMany: (records: RecordType[], checked: boolean) => void
}