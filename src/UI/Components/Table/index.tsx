import { ConfigProvider, Table } from 'antd';
import { IRecord, PropsTables } from './types';
import LoadingComponent from '../LoadingComponent';

function CustomTable<
	RecordType extends IRecord = IRecord,
>({ dataSource, loading, onRow, columns = [], ...props }: PropsTables<RecordType>) {

	return (
		<ConfigProvider>
			<Table
				{ ...props }

				loading={props.isLoading ? { indicator: <LoadingComponent />, style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } } : false}
				columns={columns}
				size="small"
				pagination={false}
				scroll={{ x: props.scrollX ?? 'max-content', y: props.scrollY ?? undefined }}
				rowKey={(record) => record.id ? record.id.toString() : record.name || ''}
				bordered
			/>
		</ConfigProvider>
	);
}

export default CustomTable;