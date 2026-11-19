import { MODULESNAME } from '@/constants/MODULESNAME';
import { GlobalFilters } from '@/UI/Components/Filters';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ResponsiveCard from '@/UI/Components/ResponsiveCard';
import PageHeaderActions from '@/UI/Components/PageHeaderActions';
import { FC, useState } from 'react';
import { TablesLoans } from './Tables';
import useModuleCustomFields from '@/infrastructure/hooks/useModuleCustomFields';
import { LoansFiltersFields } from '@/UI/Components/Filters/FiltersFields/Loans';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import useRouteStore from '@/infrastructure/context/RoutesStore';

const LoansView: FC = () => {
	const { routes } = useRouteStore(store => store);
	const [isSearching, setSearching] = useState<boolean>(false);

	const customView = useModuleCustomFields('loans');
	const fieldFiltersLoans = LoansFiltersFields(true, customView.filterableCustomFields);

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const navigate = useNavigate();

	return (
		<ResponsiveCard>
			<PageHeaderActions
				title="Créditos"
				primary={
					<Button
						icon={<PlusOutlined />}
						type='primary'
						onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`, { state: { clientId: undefined, routeIds: routes?.map(route => route.id) } })}
					>
						Nuevo crédito
					</Button>
				}
			/>

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
		</ResponsiveCard>
	);
};

export default LoansView;