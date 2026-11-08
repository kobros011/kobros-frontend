import routePaths from '@/constants/routePaths';
import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Flex, Row, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from 'react-icons/tb';
import { useQueryClient } from '@tanstack/react-query';
import { ConceptsDrawer } from '@/UI/Components/ConceptDrawer';
import { TableExpenses } from './Table';
import { GlobalFilters } from '@/UI/Components/Filters';
import { MODULESNAME } from '@/constants/MODULESNAME';
import { queryKeyDefault, queryKeyExpenses } from '@/constants/queryKeys';
import { ExpenseFiltersFields } from '@/UI/Components/Filters/FiltersFields/Expenses';
import { OnClickActions } from '@/UI/Components/RowActions';
import { Expense } from '@/domain/Expenses';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { deleteExpense } from '@/infrastructure/querys/Expense';
import { handleError } from '@/infrastructure/utils/handleError';
import { getPermission } from '@/infrastructure/utils/Permissions';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.expenses;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);
	const [count, setCount] = useState<{ active: number, inactive: number }>({ active: 0, inactive: 0 });

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { routes } = useRoutes();
	const { typeUser } = useUserStore(state => state.user);
	const { hasManageExpenses } = getPermission(typeUser);

	const deleteMutation = deleteExpense();
	const filtersFields = ExpenseFiltersFields(routes?.length > 1);

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const isInactiveTab = activeTab == `${moduleName}-inactive`;

	const onHandleDelete = (expense_id: string) => {
		deleteMutation.mutate(expense_id, {
			onSuccess: () => {
				void queryClient.invalidateQueries({ queryKey: [queryKeyExpenses.base, queryKeyDefault.list], exact: false });
				notification.success({ message: `El gasto fue ${isInactiveTab ? 'activado' : 'desactivado'} exitosamente` });
			},
			onError: (error) => {
				notification.error({ message: handleError(error, `Ocurrió un error al ${isInactiveTab ? 'activar' : 'desactivar'} el gasto`) });
			},
		});
	};

	const actions: OnClickActions<Expense> = {
		delete: (record: Expense) => onHandleDelete(record.id),
		see: (record: Expense) => void navigate(`${record.id}`),
		edit: (record: Expense) => void navigate(`${record.id}/editar`),
		inactiveTab: isInactiveTab,
		canEdit: hasManageExpenses,
		canDelete: hasManageExpenses,
	};

	return (
		<>
			<div className="page-header">
				<Row justify='space-between' align={'middle'}>
					<Col>
						<Typography.Title level={2}>Gastos</Typography.Title>
					</Col>
					<Col>
						<Flex gap={5} justify="center" align="center">
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
							>
								Registrar
							</Button>
							<Button
								icon={<TbListDetails />}
								type="primary"
								onClick={() => setIsOpen(true)}
							>
								Conceptos
							</Button>
						</Flex>
					</Col>
				</Row>
			</div>

			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre gasto)'
				moduleName={MODULESNAME.expenses}
				filters={filtersFields}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '', date: undefined, expenseConceptId: undefined, routeId: routes?.length > 1 ? undefined : routes?.map(item => item.id)?.[0] }}
			/>

			<Tabs
				style={{ width: '100%' }}
				activeKey={activeTab}
				onChange={(activeKey: string) => setActiveTab(activeKey)}
				items={[
					{
						key: `${moduleName}-active`,
						label: `Activos (${count.active})`,
						forceRender: true,
						children: <TableExpenses key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} />,
					},
					{
						key: `${moduleName}-inactive`,
						label: `Inactivos (${count.inactive})`,
						forceRender: true,
						children: <TableExpenses key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} />,
					},
				]}
			/>

			<ConceptsDrawer onClose={() => setIsOpen(false)} isOpen={isOpen} />
		</>
	);
};
