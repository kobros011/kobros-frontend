import routePaths from '@/constants/routePaths';
import { LoanFullRead } from '@/domain/Loan';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

export const getColumns = () => {

	const navigate = useNavigate();

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
		},
		{
			key: 'valueTotalLoan',
			title: 'Saldo total',
			dataIndex: 'valueTotalLoan',
			typeRender: 'money',
			width: 130,
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
		},
		{
			key: 'paymentMethod',
			title: 'Forma de pago',
			dataIndex: 'paymentMethod',
			width: 130,
			render: (paymentMethod: string) => {
				return <Tag color="blue" >{paymentMethod.toUpperCase()}</Tag>;
			},
		},
	];

	columns.push(
		{
			key: 'action',
			title: 'Acciones',
			width: 80,
			render: (record: LoanFullRead) => {

				return <Button onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${record.id}`, { state: { clientId: record?.clientId, routesIds: [record?.routeId] } })} size='small' type='primary'><Tooltip color='lime' title='Ver'><EyeOutlined /></Tooltip></Button>;
			},
		},
	);

	return BuildColumns(columns);
};