import { MODULESNAME } from '@/constants/MODULESNAME';
import { GlobalFilters } from '@/UI/Components/Filters';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Typography } from 'antd';
import { FC, useState } from 'react';
import { TablesLoans } from './Tables';
import { LoansFiltersFields } from '@/UI/Components/Filters/FiltersFields/Loans';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import useRouteStore from '@/infrastructure/context/RoutesStore';

const LoansView: FC = () => {
	const { routes } = useRouteStore(store => store);
	const [isSearching, setSearching] = useState<boolean>(false);

	const fieldFiltersLoans = LoansFiltersFields(true);

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const navigate = useNavigate();

	return (
		<Card>
			<div className='page-header'>
				<Row justify={'space-between'} align={'middle'}>
					<Col>
						<Typography.Title level={2}>Créditos</Typography.Title>
					</Col>
					<Col>
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`, { state: { clientId: undefined, routeIds: routes?.map(route => route.id) } })}
						>
							Nuevo crédito
						</Button>
					</Col>
				</Row>

			</div>

			<GlobalFilters
				placeholderSearch='Buscar(Ej: No. crédito, Nombre o documento cliente)'
				moduleName={MODULESNAME.loans}
				filters={fieldFiltersLoans}
				onSearch={onHandlerFilter}
				initialFilters={{ dateSearchRangeinitialDate: '', endDate: '', initialDate: '' }}
			/>

			<TablesLoans
				isSearching={isSearching}
			/>
		</Card>
	);
};

export default LoansView;