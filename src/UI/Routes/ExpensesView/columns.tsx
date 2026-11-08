import { Expense } from '@/domain/Expenses';
import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { BuildColumns, CustomColumn } from '@/infrastructure/utils/BuildColumns';
import { OnClickActions, useRowActions } from '@/UI/Components/RowActions';
import { TagConcept } from '@/UI/Components/TagConcept';

export const getColumns = (actions: OnClickActions<Expense>) => {

	const { routes } = useRoutes();
	const { columnActions } = useRowActions<Expense>(actions);

	const columns: CustomColumn<Expense>[] = [
		{
			key: 'name',
			title: 'Nombre',
			dataIndex: 'name',
			width: 200,
		},
		{
			key: 'concept',
			title: 'Concepto',
			dataIndex: 'expenseConcept',
			width: 200,
			render: (expenseConcept?: ExpensesConcepts) => <TagConcept concept={expenseConcept} />,
		},
		{
			key: 'value',
			title: 'Valor',
			dataIndex: 'value',
			typeRender: 'money',
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
			key: 'userGenerated',
			title: 'Generado por',
			dataIndex: 'userGenerated',
			width: 200,
			defaultVisible: false,
		},
		{
			key: 'createdAt',
			title: 'Fecha creación',
			dataIndex: 'createdAt',
			typeRender: 'date',
			width: 200,
			defaultVisible: false,
		},
		{
			key: 'updatedAt',
			title: 'Fecha edición',
			dataIndex: 'updatedAt',
			typeRender: 'date',
			width: 200,
			defaultVisible: false,
		},
		columnActions,
	];

	if (routes?.length > 1) {
		columns.splice(3, 0, {
			key: 'route',
			title: 'Ruta',
			dataIndex: 'routeId',
			width: 200,
			render: (routeId: string) => routes.find(r => r.id === routeId)?.name,
		});
	}

	return BuildColumns(columns);
};
