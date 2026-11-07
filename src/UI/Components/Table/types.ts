import { TableProps } from 'antd';
import { ReactNode } from 'react';

export interface IRecord {
	id?: string | number | null;
	name?: string | null | undefined;
	isHovered?: boolean;
	active?: boolean;
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
}