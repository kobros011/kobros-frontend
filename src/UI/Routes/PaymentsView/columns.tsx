import routePaths from '@/constants/routePaths';
import { DelinquencyItemDto, PortfolioItemDto } from '@/infrastructure/dto/ReportDto';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { HistoryOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { formatRouteMoney } from '@/infrastructure/utils/money';
import { PrimaryTooltip } from '@/UI/Components/PrimaryTooltip';
import { useNavigate } from 'react-router-dom';

/** El reporte de cartera no trae `id`; se usa `loan_id` como tal (requerido por CustomTable). */
export type PortfolioItem = PortfolioItemDto & { id: string };
export type DelinquencyItem = DelinquencyItemDto & { id: string };

const buildActionColumn = <T extends { loan_id: string; client_id: string; route_id: string }>(navigate: ReturnType<typeof useNavigate>): CustomColumn<T> => ({
	key: 'action',
	title: 'Acciones',
	width: 80,
	render: (record: T) => (
		<Button
			onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${record.loan_id}`, { state: { clientId: record?.client_id, routesIds: [record?.route_id] } })}
			size='small'
			type='primary'
		>
			<PrimaryTooltip title='Historial'><HistoryOutlined /></PrimaryTooltip>
		</Button>
	),
});

export const getPortfolioColumns = () => {
	const navigate = useNavigate();

	const columns: CustomColumn<PortfolioItem>[] = [
		{ key: 'client_name', title: 'Cliente', dataIndex: 'client_name', width: 200 },
		{ key: 'route_name', title: 'Ruta', dataIndex: 'route_name', width: 140 },
		{ key: 'loan_number', title: 'Crédito #', dataIndex: 'loan_number', width: 100 },
		{ key: 'value_total_loan', title: 'Valor crédito', dataIndex: 'value_total_loan', width: 120, typeRender: 'money' },
		{ key: 'total_paid', title: 'Pagado', dataIndex: 'total_paid', width: 120, typeRender: 'money' },
		{
			key: 'balance',
			title: 'Saldo',
			dataIndex: 'balance',
			width: 120,
			render: (value: number, record) => <Tag color='blue'>{formatRouteMoney(value, record.route_id)}</Tag>,
		},
		{ key: 'end_date', title: 'Vence', dataIndex: 'end_date', width: 100, typeRender: 'date' },
		{ key: 'payment_method', title: 'Método', dataIndex: 'payment_method', width: 120 },
		buildActionColumn<PortfolioItem>(navigate),
	];

	return BuildColumns(columns);
};

export const getDelinquencyColumns = () => {
	const navigate = useNavigate();

	const columns: CustomColumn<DelinquencyItem>[] = [
		{ key: 'client_name', title: 'Cliente', dataIndex: 'client_name', width: 200 },
		{ key: 'route_name', title: 'Ruta', dataIndex: 'route_name', width: 140 },
		{ key: 'loan_number', title: 'Crédito #', dataIndex: 'loan_number', width: 100 },
		{ key: 'value_total_loan', title: 'Valor crédito', dataIndex: 'value_total_loan', width: 120, typeRender: 'money' },
		{
			key: 'balance',
			title: 'Saldo en mora',
			dataIndex: 'balance',
			width: 130,
			render: (value: number, record) => <Tag color='red'>{formatRouteMoney(value, record.route_id)}</Tag>,
		},
		{
			key: 'days_overdue',
			title: 'Días en mora',
			dataIndex: 'days_overdue',
			width: 110,
			render: (value: number) => <Tag color={value > 30 ? 'red' : 'orange'}>{value} días</Tag>,
		},
		{ key: 'overdue_since', title: 'Vencida desde', dataIndex: 'overdue_since', width: 120, typeRender: 'date' },
		buildActionColumn<DelinquencyItem>(navigate),
	];

	return BuildColumns(columns);
};
