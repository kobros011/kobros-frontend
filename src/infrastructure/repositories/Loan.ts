import axios from 'axios';
import { ImplementationBase } from './base';
import { Loan, LoanFull, LoanModel } from '@/domain/Loan';
import { LoanDto, LoanFullReadDTO } from '../dto/LoanDto';
import { Filters, FiltersModel } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';
import { mapPage, toPageQuery } from '../utils/pagination';

export class ImplementationLoanRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/loans/';

	async getLoan(id: string) {
		const response = await axios.get<LoanDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: LoanModel.FullReadToDomain(response?.data),
		};
	}

	/** Efectivo disponible hoy en la ruta para entregar un crédito nuevo (nunca negativo). */
	async availableCash(routeId: string): Promise<number> {
		const response = await axios.get<{ available: number }>(`${this.baseUrl}available-cash`, { params: { route_id: routeId } });
		return Number(response.data.available ?? 0);
	}

	async listLoans(filters: Partial<Filters>) {
		const response = await axios.get<LoanFullReadDTO[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });

		return {
			...response,
			data: response?.data?.map(loan => LoanModel.FullReadToDomain(loan)),
		};
	}

	async getPage(filters: Partial<Filters>, pagination: PaginationParams) {
		const response = await axios.get<PageDto<LoanFullReadDTO>>(this.baseUrl, {
			params: { ...FiltersModel.toDto(filters), ...toPageQuery(pagination) },
		});

		return { ...response, page: mapPage(response.data, dto => LoanModel.FullReadToDomain(dto)) };
	}

	async create(data: Partial<LoanFull>) {
		if (!data) return;

		return axios.post<LoanDto>(this.baseUrl, LoanModel.FullToDto(data as LoanFull));	
	}

	async update(data: Partial<Loan>) {
		if (!data || !data.id) return;

		return axios.put<LoanDto>(this.buildUrl({ id: data.id }), LoanModel.ToDto(data as Loan));	
	}
}

export const repository = new ImplementationLoanRepository();