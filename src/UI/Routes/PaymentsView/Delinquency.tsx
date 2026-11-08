import { MODULESNAME } from '@/constants/MODULESNAME';
import { FC, useEffect, useState } from 'react';
import { GlobalFilters, ItemFilter } from '@/UI/Components/Filters';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { SelectRoute } from '@/UI/Components/Fields/SelectRoute';
import { getPageDelinquency } from '@/infrastructure/querys/Report';
import { CurrencyTabs, useCurrencyScope } from '@/UI/Components/CurrencyTabs';
import { DelinquencyTotals } from './CarteraTotals';
import CustomTable from '@/UI/Components/Table';
import { CarteraLayout } from './CarteraLayout';
import { DelinquencyItem, getDelinquencyColumns } from './columns';

const Delinquency: FC = () => {
	const columns = getDelinquencyColumns();
	const { routes } = useRoutes();
	const hasMultipleRoutes = routes.length > 1;
	const filters = filtersStore(state => state.filtersMap[MODULESNAME.payments]);
	const routeId = hasMultipleRoutes ? filters?.routeId : routes?.map(item => item.id)?.[0];

	const [currency, setCurrency] = useState<string>();
	const scope = useCurrencyScope(currency, routeId);

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify({ text: filters?.text, routeId, currency }));

	const reportFilters = { route_id: routeId, text: filters?.text, currency: scope.length === 1 ? scope[0] : undefined };
	const { items, total, isLoading, isRefetching, isFetching } = getPageDelinquency(reportFilters, { page, pageSize });

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	const dataSource: DelinquencyItem[] = items.map(item => ({ ...item, id: item.loan_id }));

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

			{!routeId && <CurrencyTabs value={currency} onChange={setCurrency} />}
			<DelinquencyTotals label="Total en mora" filters={{ route_id: routeId, text: filters?.text }} currencies={scope} />
			<CustomTable<DelinquencyItem>
				isLoading={isFetching || isLoading || isRefetching}
				columns={columns}
				dataSource={dataSource}
				moduleName={MODULESNAME.payments}
				titleField="client_name"
				pagination={{ page, pageSize, total, onChange }}
			/>
		</CarteraLayout>
	);
};

export default Delinquency;
