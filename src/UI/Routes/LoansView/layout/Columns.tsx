import { LoanFullRead } from '@/domain/Loan';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';

export const getColumns = (onSee: (record: LoanFullRead) => void) => {

	const columns: CustomColumn<LoanFullRead>[] = [
		{
			key: 'loanNumber',
			title: 'No. crédito',
			dataIndex: 'loanNumber',
			width: 100,
		},
		{
			key: 'fullName',
			title: 'Nombre cliente',
			dataIndex: 'fullName',
			width: 250,
		},
		{
			key: 'idDocument',
			title: 'Documento (Cédula)',
			dataIndex: 'idDocument',
			width: 200,
		},
		{
			key: 'routeName',
			title: 'Ruta cliente',
			dataIndex: 'routeName',
			width: 130,
		},
		{
			key: 'agreedQuotas',
			title: 'C pactadas',
			dataIndex: 'agreedQuotas',
			width: 100,
			defaultVisible: false,
		},
		{
			key: 'pendingQuotas',
			title: 'C pendientes',
			dataIndex: 'pendingQuotas',
			width: 100,
		},
		{
			key: 'canceledQuotas',
			title: 'C canceladas',
			dataIndex: 'canceledQuotas',
			width: 100,
			defaultVisible: false,
		},
		{
			key: 'valueCapital',
			title: 'Saldo capital',
			dataIndex: 'valueCapital',
			typeRender: 'money',
			width: 130,
		},
		{
			key: 'valueUtilityLoan',
			title: 'Saldo utilidad',
			dataIndex: 'valueUtilityLoan',
			typeRender: 'money',
			width: 130,
			defaultVisible: false,
		},
		{
			key: 'valueTotalLoan',
			title: 'Saldo total',
			dataIndex: 'valueTotalLoan',
			typeRender: 'money',
			width: 130,
			defaultVisible: false,
		},
		{
			key: 'initialDate',
			title: 'Fecha inicial',
			dataIndex: 'initialDate',
			typeRender: 'date',
			width: 120,
		},
		{
			key: 'endDate',
			title: 'Fecha final',
			dataIndex: 'endDate',
			typeRender: 'date',
			width: 120,
			defaultVisible: false,
		},
		{
			key: 'paymentMethod',
			title: 'Forma de pago',
			dataIndex: 'paymentMethod',
			width: 130,
			render: (paymentMethod?: string) => {
				return <Tag color="blue" >{paymentMethod?.toUpperCase() ?? '--'}</Tag>;
			},
		},
		{
			key: 'actions',
			title: 'Acciones',
			width: 80,
			render: (record: LoanFullRead) => (
				<Button onClick={() => onSee(record)} size='small' type='primary'><Tooltip color='lime' title='Ver'><EyeOutlined /></Tooltip></Button>
			),
		},
	];

	return BuildColumns(columns);
};
