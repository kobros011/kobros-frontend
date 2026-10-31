import routePaths from '@/constants/routePaths';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Row, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from 'react-icons/tb';
import { ConceptsDrawer } from '@/UI/Components/ConceptDrawer';
import { TableExpenses } from './Table';
import { GlobalFilters } from '@/UI/Components/Filters';
import { MODULESNAME } from '@/constants/MODULESNAME';
import { ExpenseFiltersFields } from '@/UI/Components/Filters/FiltersFields/Expenses';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';

export const Layout: FC = () => {
	const [isSearching, setSearching] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [count, setCount] = useState<{ active: number }>({ active: 0 });
	
	const navigate = useNavigate();
	const { routes } = useRoutes();

	const filtersFields = ExpenseFiltersFields(routes?.length > 1);

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
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
				activeKey='1'
				items={[{ label: `Gastos (${count.active})`, key: '1', forceRender: true, children: <TableExpenses isSearching={isSearching} setCount={setCount} /> }]}
			/>

			<ConceptsDrawer onClose={() => setIsOpen(false)} isOpen={isOpen} />
		</>
	);
};