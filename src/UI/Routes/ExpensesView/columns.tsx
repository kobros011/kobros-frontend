import { Expense } from '@/domain/Expenses';
import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { ACTION_COLUMN_WIDTH, IconActionButton } from '@/UI/Components/RowActions';
import { TagConcept } from '@/UI/Components/TagConcept';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { useNavigate } from 'react-router-dom';

export const getColumns = () => {

	const { routes } = useRoutes();
	const navigate = useNavigate();

	const columns: CustomColumn<Expense>[] = [
		{
			key: 'name',
			title: 'Nombre',
			dataIndex: 'name',
			width: 200,
		},
		{
			key: 'value',
			title: 'Valor',
			dataIndex: 'value',
			typeRender: 'money',
			width: 200,
		},
		{
			key: 'concept',
			title: 'Concepto',
			dataIndex: 'expenseConcept',
			width: 200,
			render: (expenseConcept: ExpensesConcepts) => {

				return <TagConcept concept={expenseConcept} />;
			},
		},
		{
			key: 'userGenerated',
			title: 'Generado por',
			dataIndex: 'userGenerated',
			width: 200,
		},
		{
			key: 'date',
			title: 'Fecha',
			dataIndex: 'date',
			typeRender: 'date',
			width: 200,
		},
		{
			key: 'actions',
			title: 'Acciones',
			width: ACTION_COLUMN_WIDTH,
			render: (record: Expense) => {
				return (
					<Space.Compact style={{ display: 'inline-flex' }}>
						<IconActionButton
							title="Ver"
							icon={<EyeOutlined />}
							onClick={() => void navigate(`${record.id}`)}
							ghost
						/>
						<IconActionButton
							title="Editar"
							icon={<EditOutlined />}
							onClick={() => void navigate(`${record.id}/editar`)}
						/>
					</Space.Compact>
				);
			},
		},
	];

	if (routes?.length > 1) {
		columns.splice(3, 0, {
			key: 'route',
			title: 'Ruta',
			dataIndex: 'routeId',
			width: 200,
			render: (routeId: string) => {

				return routes.find(r => r.id === routeId)?.name;
			},
		});
	}

	return BuildColumns(columns);
};
