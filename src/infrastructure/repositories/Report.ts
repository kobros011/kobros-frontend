import axios from 'axios';
import { ImplementationBase } from './base';
import { DelinquencyItemDto, PaymentHistoryItemDto, PortfolioItemDto, ReportSummaryDto } from '../dto/ReportDto';
import {
	CriticalLoanDto, DashboardFiltersDto, DashboardParams, DashboardSummaryDto, PeriodMode, PeriodReportDto,
} from '../dto/DashboardDto';
import { PageDto } from '../dto/PageDto';
import { PaginationParams } from '@/domain/Pagination';
import { toPageQuery, mapPage } from '../utils/pagination';

interface CarteraParams {
	route_id?: string
	brand_id?: string
	text?: string
}

export class ImplementationReportRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/reports/';

	async getPortfolio(params?: { route_id?: string; brand_id?: string }) {
		const response = await axios.get<PortfolioItemDto[]>(`${this.baseUrl}portfolio`, { params });
		return response;
	}

	async getDelinquency(params?: { route_id?: string; brand_id?: string }) {
		const response = await axios.get<DelinquencyItemDto[]>(`${this.baseUrl}delinquency`, { params });
		return response;
	}

	async getPortfolioPage(filters: CarteraParams, pagination: PaginationParams) {
		const response = await axios.get<PageDto<PortfolioItemDto>>(`${this.baseUrl}portfolio`, {
			params: { ...filters, ...toPageQuery(pagination) },
		});
		return { ...response, page: mapPage(response.data, item => item) };
	}

	async getDelinquencyPage(filters: CarteraParams, pagination: PaginationParams) {
		const response = await axios.get<PageDto<DelinquencyItemDto>>(`${this.baseUrl}delinquency`, {
			params: { ...filters, ...toPageQuery(pagination) },
		});
		return { ...response, page: mapPage(response.data, item => item) };
	}

	async getPortfolioSummary(filters: CarteraParams) {
		const response = await axios.get<ReportSummaryDto>(`${this.baseUrl}portfolio/summary`, { params: filters });
		return response.data;
	}

	async getDelinquencySummary(filters: CarteraParams) {
		const response = await axios.get<ReportSummaryDto>(`${this.baseUrl}delinquency/summary`, { params: filters });
		return response.data;
	}

	async getDashboardFilters() {
		const response = await axios.get<DashboardFiltersDto>(`${this.baseUrl}dashboard/filters`);
		return response.data;
	}

	async getDashboardSummary(params: DashboardParams) {
		const response = await axios.get<DashboardSummaryDto>(`${this.baseUrl}dashboard/summary`, { params });
		return response.data;
	}

	async getDashboardCritical(params: DashboardParams & { text?: string }, pagination: PaginationParams) {
		const response = await axios.get<PageDto<CriticalLoanDto>>(`${this.baseUrl}dashboard/critical`, {
			params: { ...params, ...toPageQuery(pagination) },
		});
		return mapPage(response.data, item => item);
	}

	async getPeriod(mode: PeriodMode, date: string | undefined, params: DashboardParams) {
		const response = await axios.get<PeriodReportDto>(`${this.baseUrl}period`, { params: { mode, date, ...params } });
		return response.data;
	}

	async getClientHistory(clientId: string) {
		const response = await axios.get<PaymentHistoryItemDto[]>(`${this.baseUrl}clients/${clientId}/history`);
		return response;
	}
}

export const repository = new ImplementationReportRepository();
