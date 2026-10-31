import axios from 'axios';
import { ImplementationBase } from './base';
import { DelinquencyItemDto, PaymentHistoryItemDto, PortfolioItemDto } from '../dto/ReportDto';

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

	async getClientHistory(clientId: string) {
		const response = await axios.get<PaymentHistoryItemDto[]>(`${this.baseUrl}clients/${clientId}/history`);
		return response;
	}
}

export const repository = new ImplementationReportRepository();
