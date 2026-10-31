import axios from 'axios';
import { ImplementationBase } from './base';
import { PaymentModel } from '@/domain/Payment';
import { PaymentBasicDto, PaymentDto } from '../dto/PaymentDto';
import { Filters, FiltersModel } from '@/domain/Filters';

export class ImplementationPaymentRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/payments/';

	async getPayment(id: string) {
		const response = await axios.get<PaymentDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: PaymentModel.ToDomain(response?.data),
		};
	}

	async getListPaymentsBasic(loanId?: string) {
		const response = await axios.get<PaymentBasicDto[]>(this.baseUrl, { params: { loan_id: loanId } });
		return {
			...response,
			payments: response?.data?.map(payment => PaymentModel.ToDomainBasic(payment)),
		};
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