import { MODULESNAME } from '@/constants/MODULESNAME';
import { FC } from 'react';
import { GlobalFilters, ItemFilter } from '@/UI/Components/Filters';
import { TablePortfolio } from './Table';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { SelectRoute } from '@/UI/Components/Fields/SelectRoute';
import { CarteraLayout } from './CarteraLayout';

export const Layout: FC = () => {
	const { routes } = useRoutes();
	const hasMultipleRoutes = routes.length > 1;

	const filtersFields: ItemFilter[] = [
		{
			key: 'routeId',
			name: 'routeId',
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta para filtrar" />
			),
			isShow: hasMultipleRoutes,
		},
	];

	return (
		<CarteraLayout>
			<GlobalFilters
				placeholderSearch='Buscar (ej. nombre completo, No. crédito)'
				moduleName={MODULESNAME.payments}
				filters={filtersFields}
				onSearch={() => {}}
				initialFilters={{ text: '', routeId: undefined }}
			/>

			<TablePortfolio />
		</CarteraLayout>
	);
};

export default Layout;
