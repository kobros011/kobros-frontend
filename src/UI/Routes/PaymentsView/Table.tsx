import { MODULESNAME } from '@/constants/MODULESNAME';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect, useState } from 'react';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { getPagePortfolio } from '@/infrastructure/querys/Report';
import { CurrencyTabs, useCurrencyScope } from '@/UI/Components/CurrencyTabs';
import { PortfolioTotals } from './CarteraTotals';
import { PortfolioItem, getPortfolioColumns } from './columns';

export const TablePortfolio: FC = () => {
	const columns = getPortfolioColumns();
	const { routes } = useRoutes();
	const filters = filtersStore(state => state.filtersMap[MODULESNAME.payments]);
	const routeId = routes.length > 1 ? filters?.routeId : routes?.map(item => item.id)?.[0];

	const [currency, setCurrency] = useState<string>();
	const scope = useCurrencyScope(currency, routeId);

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify({ text: filters?.text, routeId, currency }));

	const reportFilters = { route_id: routeId, text: filters?.text, currency: scope.length === 1 ? scope[0] : undefined };
	const { items, total, isLoading, isRefetching, isFetching } = getPagePortfolio(reportFilters, { page, pageSize });

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	const dataSource: PortfolioItem[] = items.map(item => ({ ...item, id: item.loan_id }));

	return (
		<>
			{!routeId && <CurrencyTabs value={currency} onChange={setCurrency} />}
			<PortfolioTotals label="Total en cartera" filters={{ route_id: routeId, text: filters?.text }} currencies={scope} />
			<CustomTable<PortfolioItem>
				isLoading={isFetching || isLoading || isRefetching}
				columns={columns}
				dataSource={dataSource}
				moduleName={MODULESNAME.payments}
				titleField="client_name"
				pagination={{ page, pageSize, total, onChange }}
			/>
		</>
	);
};

export default TablePortfolio;
