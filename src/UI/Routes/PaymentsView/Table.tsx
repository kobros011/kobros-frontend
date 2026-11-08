import { MODULESNAME } from '@/constants/MODULESNAME';
import CustomTable from '@/UI/Components/Table';
import { FC, useEffect } from 'react';
import { Typography } from 'antd';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import { getPagePortfolio, getPortfolioSummary } from '@/infrastructure/querys/Report';
import { PortfolioItem, getPortfolioColumns } from './columns';

const { Text } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

export const TablePortfolio: FC = () => {
	const columns = getPortfolioColumns();
	const { routes } = useRoutes();
	const filters = filtersStore(state => state.filtersMap[MODULESNAME.payments]);
	const routeId = routes.length > 1 ? filters?.routeId : routes?.map(item => item.id)?.[0];

	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify({ text: filters?.text, routeId }));

	const reportFilters = { route_id: routeId, text: filters?.text };
	const { items, total, isLoading, isRefetching, isFetching } = getPagePortfolio(reportFilters, { page, pageSize });
	const { summary } = getPortfolioSummary(reportFilters);

	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	const dataSource: PortfolioItem[] = items.map(item => ({ ...item, id: item.loan_id }));

	return (
		<>
			<Text type="secondary" style={{ display: 'block', margin: '16px 0' }}>
				Total en cartera: <strong>{formatMoney(summary?.total_balance ?? 0)}</strong> — {summary?.count ?? 0} crédito(s)
			</Text>
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
