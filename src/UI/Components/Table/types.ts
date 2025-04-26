import { TableProps } from 'antd';

export interface IRecord {
	id?: string | number | null;
	name?: string | null | undefined;
	isHovered?: boolean;
}

export interface PropsTables<
	RecordType extends IRecord = IRecord,
> extends Pick<TableProps<RecordType>, 'columns' | 'dataSource' | 'loading' | 'sticky' | 'rowClassName' | 'onRow'> {
	scrollX?: number | true | string | undefined,
	scrollY?: number | string | undefined,
	isLoading?: boolean
}