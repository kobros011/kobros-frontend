import { queryKeyReports } from '@/constants/queryKeys';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Report';
import { PaginationParams } from '@/domain/Pagination';
import { DashboardParams, PeriodMode } from '../dto/DashboardDto';

interface CarteraFilters {
	route_id?: string
	brand_id?: string
	text?: string
}

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

export const getPagePortfolio = (filters: CarteraFilters, pagination: PaginationParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.portfolio, 'page', filters, pagination],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPortfolioPage(filters, pagination),
	});

	return {
		...queryInfo,
		items: queryInfo.data?.page.items ?? [],
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const getPageDelinquency = (filters: CarteraFilters, pagination: PaginationParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.delinquency, 'page', filters, pagination],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getDelinquencyPage(filters, pagination),
	});

	return {
		...queryInfo,
		items: queryInfo.data?.page.items ?? [],
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const getPortfolioSummary = (filters: CarteraFilters) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.portfolio, 'summary', filters],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPortfolioSummary(filters),
	});

	return { ...queryInfo, summary: queryInfo.data };
};

export const getDelinquencySummary = (filters: CarteraFilters) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, queryKeyReports.delinquency, 'summary', filters],
		placeholderData: keepPreviousData,
		queryFn: () => repository.getDelinquencySummary(filters),
	});

	return { ...queryInfo, summary: queryInfo.data };
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

// ---- Dashboard de Reportes (Resumen · Semanal · Anual) --------------------------------------
// Las cifras ya vienen calculadas por el backend; el refresco manual invalida `queryKeyReports.base`.
const DASHBOARD = 'dashboard';
const DASHBOARD_STALE_MS = 30 * 1000;

export const getDashboardFilters = () => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, DASHBOARD, 'filters'],
		staleTime: DASHBOARD_STALE_MS,
		queryFn: () => repository.getDashboardFilters(),
	});

	return { ...queryInfo, filters: queryInfo.data };
};

export const getDashboardSummary = (params: DashboardParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, DASHBOARD, 'summary', params],
		staleTime: DASHBOARD_STALE_MS,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getDashboardSummary(params),
	});

	return { ...queryInfo, summary: queryInfo.data };
};

export const getDashboardCritical = (params: DashboardParams & { text?: string }, pagination: PaginationParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, DASHBOARD, 'critical', params, pagination],
		staleTime: DASHBOARD_STALE_MS,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getDashboardCritical(params, pagination),
	});

	return { ...queryInfo, page: queryInfo.data };
};

export const getPeriodReport = (mode: PeriodMode, date: string | undefined, params: DashboardParams) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyReports.base, DASHBOARD, 'period', mode, date, params],
		staleTime: DASHBOARD_STALE_MS,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPeriod(mode, date, params),
	});

	return { ...queryInfo, report: queryInfo.data };
};
