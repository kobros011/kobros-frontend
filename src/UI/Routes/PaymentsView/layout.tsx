import { MODULESNAME } from '@/constants/MODULESNAME';
import { Col, Row, Typography } from 'antd';
import { FC, useState } from 'react';
import { GlobalFilters } from '@/UI/Components/Filters';
import { TablePayments } from './Table';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { PaymentFiltersFields } from '@/UI/Components/Filters/FiltersFields/Payment';

export const Layout: FC = () => {
	const [isSearching, setSearching] = useState<boolean>(false);
	const { routes } = useRoutes();

	const hasMultipleRoutes = routes.length > 1;

	const filtersFields = PaymentFiltersFields(hasMultipleRoutes);

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Pagos</Typography.Title>
					</Col>
				</Row>
			</div>
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre completo, documento, No. crédito)'
				moduleName={MODULESNAME.payments}
				filters={filtersFields}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '', routeId: undefined, status: undefined }}
			/>

			<TablePayments isSearching={isSearching} />
		</>
	);
};