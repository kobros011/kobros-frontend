import { FC } from 'react';
import { Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getDelinquencyReport } from '@/infrastructure/querys/Report';
import { DelinquencyItemDto } from '@/infrastructure/dto/ReportDto';

const { Title } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const columns: ColumnsType<DelinquencyItemDto> = [
	{
		title: 'Cliente',
		dataIndex: 'client_name',
		key: 'client_name',
		sorter: (a, b) => a.client_name.localeCompare(b.client_name),
	},
	{
		title: 'Ruta',
		dataIndex: 'route_name',
		key: 'route_name',
	},
	{
		title: 'Crédito #',
		dataIndex: 'loan_number',
		key: 'loan_number',
		align: 'center',
	},
	{
		title: 'Valor crédito',
		dataIndex: 'value_total_loan',
		key: 'value_total_loan',
		align: 'right',
		render: (v: number) => formatMoney(v),
	},
	{
		title: 'Saldo en mora',
		dataIndex: 'balance',
		key: 'balance',
		align: 'right',
		render: (v: number) => <Tag color='red'>{formatMoney(v)}</Tag>,
		sorter: (a, b) => a.balance - b.balance,
		defaultSortOrder: 'descend',
	},
	{
		title: 'Días en mora',
		dataIndex: 'days_overdue',
		key: 'days_overdue',
		align: 'center',
		render: (v: number) => <Tag color={v > 30 ? 'red' : 'orange'}>{v} días</Tag>,
		sorter: (a, b) => a.days_overdue - b.days_overdue,
	},
	{
		title: 'Venció',
		dataIndex: 'end_date',
		key: 'end_date',
		align: 'center',
	},
];

const Delinquency: FC = () => {
	const { items, isLoading } = getDelinquencyReport();

	const totalBalance = items.reduce((s, i) => s + i.balance, 0);

	return (
		<div>
			<Title level={4} style={{ marginBottom: 8 }}>Cartera en mora</Title>
			<p style={{ marginBottom: 16, color: 'var(--ant-color-text-secondary)' }}>
				Total en mora: <strong>{formatMoney(totalBalance)}</strong> — {items.length} crédito(s)
			</p>
			<Table
				columns={columns}
				dataSource={items}
				rowKey='loan_id'
				loading={isLoading}
				size='small'
				scroll={{ x: 700 }}
				pagination={{ pageSize: 20, showTotal: (total) => `${total} registros` }}
			/>
		</div>
	);
};

export default Delinquency;
