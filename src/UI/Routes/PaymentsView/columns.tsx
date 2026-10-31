import routePaths from '@/constants/routePaths';
import { PaymentStatus } from '@/constants/types';
import { Payment } from '@/domain/Payment';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { formatNumber } from '@/infrastructure/utils/formaNumber';
import { PayPaymentField } from '@/UI/Components/Fields/PayPaymentField';
import { HistoryOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

export const getColumns = () => {

	const navigate = useNavigate();

	const statusConfig = {
		PENDIENTE: 'blue',
		PAGADO: 'green',
		MORA: 'red',
	};

	const columns: CustomColumn<Payment>[] = [
		{
			key: 'quotaNumber',
			title: 'No. cuota',
			dataIndex: 'quotaNumber',
			width: 80,
			render: (quotaNumber: number, record) => {
				return `${quotaNumber}/${record.agreedQuotas}`;
			},
		},
		{
			key: 'pendingQuotas',
			title: 'C Pen',
			dataIndex: 'pendingQuotas',
			width: 80,
		},
		{
			key: 'canceledQuotas',
			title: 'C Can',
			dataIndex: 'canceledQuotas',
			width: 80,
		},
		{
			key: 'balanceValue',
			title: 'Saldo valor',
			dataIndex: 'valueQuotaFixed',
			width: 100,
			render: (valueQuotaFixed: number, record) => {
				return formatNumber((Number(valueQuotaFixed) * record.pendingQuotas) + Number(record.totalDefault), 2);
			},
		},
		{
			key: 'valueQuotaFixed',
			title: 'Cuota',
			dataIndex: 'valueQuotaFixed',
			typeRender: 'money',
			precision: 2,
			width: 80,
		},
		{
			key: 'client',
			title: 'Cliente',
			dataIndex: 'clientFullName',
			width: 250,
		},
		{
			key: 'pay',
			title: 'Abono',
			width: '13rem',
			render: (record: Payment) => {
				return <PayPaymentField record={record} />;
			},
		},
		{
			key: 'applied',
			title: 'Aplicado',
			dataIndex: 'applied',
			typeRender: 'money',
			width: 100,
		},
		{
			key: 'status',
			title: 'Estado',
			dataIndex: 'status',
			width: 80,
			render: (value: PaymentStatus) => {
				const newValue = value.toLocaleUpperCase() as PaymentStatus;
				return <Tag color={statusConfig[newValue]}>{newValue}</Tag>;
			},
		},
		{
			key: 'paymentMethod',
			title: 'Forma de pago',
			dataIndex: 'paymentMethod',
			width: 100,
			render: (value: string) => (`${value.toLocaleUpperCase()}`),
		},
		{
			key: 'payDate',
			title: 'Fecha de pago',
			dataIndex: 'payDate',
			width: 100,
			typeRender: 'date',
		},
		{
			key: 'paymentDate',
			title: 'Fecha realizo pago',
			dataIndex: 'paymentDate',
			width: 123,
			typeRender: 'date',
		},
	];

	columns.push(
		{
			key: 'action',
			title: 'Acciones',
			width: 80,
			render: (record: Payment) => {

				return <Button onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${record.loanId}`, { state: { clientId: record?.clientId, routesIds: [record?.routeId] } })} size='small' type='primary'><Tooltip color='lime' title='Historial'><HistoryOutlined /></Tooltip></Button>;
			},
		},
	);

	return BuildColumns(columns);
};