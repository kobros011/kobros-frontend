import { queryKeyReports } from '@/constants/queryKeys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Report';

export const getPortfolioReport = (params?: { route_id?: string; brand_id?: string }) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.portfolio, params],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPortfolio(params),
	});

	return {
		...queryInfo,
		items: queryInfo.data?.data ?? [],
	};
};

export const getDelinquencyReport = (params?: { route_id?: string; brand_id?: string }) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.delinquency, params],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getDelinquency(params),
	});

	return {
		...queryInfo,
		items: queryInfo.data?.data ?? [],
	};
};

export const getClientHistory = (clientId?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.history, clientId],
		enabled: !!clientId,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getClientHistory(clientId!),
	});

	return {
		...queryInfo,
		items: queryInfo.data?.data ?? [],
	};
};
