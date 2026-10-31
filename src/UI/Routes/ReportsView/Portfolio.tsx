import { FC } from 'react';
import { Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getPortfolioReport } from '@/infrastructure/querys/Report';
import { PortfolioItemDto } from '@/infrastructure/dto/ReportDto';

const { Title } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const columns: ColumnsType<PortfolioItemDto> = [
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
		filters: [],
		onFilter: (value, record) => record.route_name === value,
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
		sorter: (a, b) => a.value_total_loan - b.value_total_loan,
	},
	{
		title: 'Pagado',
		dataIndex: 'total_paid',
		key: 'total_paid',
		align: 'right',
		render: (v: number) => formatMoney(v),
	},
	{
		title: 'Saldo',
		dataIndex: 'balance',
		key: 'balance',
		align: 'right',
		render: (v: number) => <Tag color='blue'>{formatMoney(v)}</Tag>,
		sorter: (a, b) => a.balance - b.balance,
		defaultSortOrder: 'descend',
	},
	{
		title: 'Vence',
		dataIndex: 'end_date',
		key: 'end_date',
		align: 'center',
	},
	{
		title: 'Método',
		dataIndex: 'payment_method',
		key: 'payment_method',
	},
];

const Portfolio: FC = () => {
	const { items, isLoading } = getPortfolioReport();

	const totalBalance = items.reduce((s, i) => s + i.balance, 0);

	return (
		<div>
			<Title level={4} style={{ marginBottom: 8 }}>Cartera activa</Title>
			<p style={{ marginBottom: 16, color: 'var(--ant-color-text-secondary)' }}>
				Total en cartera: <strong>{formatMoney(totalBalance)}</strong> — {items.length} crédito(s)
			</p>
			<Table
				columns={columns}
				dataSource={items}
				rowKey='loan_id'
				loading={isLoading}
				size='small'
				scroll={{ x: 800 }}
				pagination={{ pageSize: 20, showTotal: (total) => `${total} registros` }}
			/>
		</div>
	);
};

export default Portfolio;
