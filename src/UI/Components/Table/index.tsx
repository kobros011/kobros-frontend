import { ConfigProvider, Table } from 'antd';
import { IRecord, PropsTables } from './types';
import LoadingComponent from '../LoadingComponent';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

function CustomTable<
	RecordType extends IRecord = IRecord,
>({ dataSource, loading, onRow, columns = [], ...props }: PropsTables<RecordType>) {
	const { isMobile } = useUserModeStore(state => state);

	return (
		<ConfigProvider>
			<Table
				{ ...props }
				dataSource={dataSource}
				loading={props.isLoading ? { indicator: <LoadingComponent />, style: { display: 'flex', justifyContent: 'center', alignItems: 'center' } } : false}
				columns={columns}
				size="small"
				pagination={false}
				scroll={{ x: props.scrollX ?? 'max-content', y: props.scrollY ?? (isMobile ? 'calc(100dvh - 200px)' : 'calc(100vh - 260px)') }}
				rowKey={(record) => record.id ? record.id.toString() : record.name || ''}
				bordered
			/>
		</ConfigProvider>
	);
}

export default CustomTable;