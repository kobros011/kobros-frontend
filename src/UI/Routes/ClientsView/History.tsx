import { FC } from 'react';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getClientHistory } from '@/infrastructure/querys/Report';
import { PaymentHistoryItemDto } from '@/infrastructure/dto/ReportDto';
import { formatRouteMoney } from '@/infrastructure/utils/money';

const { Title } = Typography;

// El historial no trae la ruta de cada pago: se muestra con la moneda principal de la marca.
const formatMoney = (val: number) => formatRouteMoney(val, undefined, { digits: 'brand' });

const statusColor: Record<string, string> = {
	pagado: 'green',
	pendiente: 'orange',
	mora: 'red',
};

const columns: ColumnsType<PaymentHistoryItemDto> = [
	{
		title: 'Crédito #',
		dataIndex: 'loan_number',
		key: 'loan_number',
		align: 'center',
	},
	{
		title: 'Cuota #',
		dataIndex: 'quota_number',
		key: 'quota_number',
		align: 'center',
	},
	{
		title: 'Fecha esperada',
		dataIndex: 'pay_date',
		key: 'pay_date',
		align: 'center',
	},
	{
		title: 'Fecha pagado',
		dataIndex: 'payment_date',
		key: 'payment_date',
		align: 'center',
		render: (v: string | null) => v ?? '—',
	},
	{
		title: 'Valor cuota',
		dataIndex: 'value',
		key: 'value',
		align: 'right',
		render: (v: number) => formatMoney(v),
	},
	{
		title: 'Abonado',
		dataIndex: 'applied',
		key: 'applied',
		align: 'right',
		render: (v: number) => formatMoney(v),
	},
	{
		title: 'Estado',
		dataIndex: 'status',
		key: 'status',
		align: 'center',
		render: (v: string) => <Tag color={statusColor[v] ?? 'default'}>{v}</Tag>,
	},
];

interface Props {
	clientId?: string;
}

const ClientHistory: FC<Props> = ({ clientId }) => {
	const { items, isLoading } = getClientHistory(clientId);

	return (
		<div>
			<Title level={5} style={{ marginBottom: 12 }}>Historial de pagos</Title>
			<Table
				columns={columns}
				dataSource={items}
				rowKey='payment_id'
				loading={isLoading}
				size='small'
				scroll={{ x: 700 }}
				pagination={{ pageSize: 15, showTotal: (total) => `${total} registros` }}
			/>
		</div>
	);
};

export default ClientHistory;
