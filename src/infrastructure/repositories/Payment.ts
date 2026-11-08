import axios from 'axios';
import { ImplementationBase } from './base';
import { PaymentModel } from '@/domain/Payment';
import { PaymentDto } from '../dto/PaymentDto';
import { Filters, FiltersModel } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';
import { PaymentHistoryPageDto, PaymentHistoryStatus } from '../dto/PaymentHistoryDto';
import { toPageQuery } from '../utils/pagination';

export class ImplementationPaymentRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/payments/';

	async getPayment(id: string) {
		const response = await axios.get<PaymentDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: PaymentModel.ToDomain(response?.data),
		};
	}

	async getPaymentHistory(loanId: string, status: PaymentHistoryStatus | undefined, pagination: PaginationParams) {
		const response = await axios.get<PaymentHistoryPageDto>(`${this.baseUrl}history`, {
			params: { loan_id: loanId, status, ...toPageQuery(pagination) },
		});
		return response.data;
	}

	async getListPayments(filters: Partial<Filters>) {
		const response = await axios.get<PaymentDto[]>(this.buildUrl({ method: 'full' }), { params: FiltersModel.toDto(filters) });
		return {
			...response,
			payments: response?.data?.map(payment => PaymentModel.ToDomain(payment)),
		};
	}

	async payPayment(paymentId: string, value: number) {
		return axios.put(`${this.baseUrl}${paymentId}/pay?value=${value}`);
	}

}

export const repository = new ImplementationPaymentRepository();