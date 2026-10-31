import { PaymentBasicDto, PaymentDto } from '@/infrastructure/dto/PaymentDto';
import { BaseDomain } from './BaseDomain';
import { PaymentStatus } from '@/constants/types';


export interface Payment extends BaseDomain {
	payDate: string,
	paymentDate: string | null,
	quotaNumber: number,
	value: number,
	creditValue: number,
	status: PaymentStatus,
	loanId: string,
	pendingQuotas: number,
	canceledQuotas: number,
	agreedQuotas: number,
	totalDefault: number,
	valueCapital: number,
	valueQuotaFixed: number,
	applied: number,
	paymentMethod: string,
	valueTotalLoan: number,
	clientId: string,
	routeId: string,
	clientFullName: string
}

export interface PaymentBasic extends Pick<Payment, 'id' | 'payDate' | 'paymentDate' | 'quotaNumber' | 'value' | 'creditValue' | 'status' | 'loanId' | 'active' | 'createdAt' | 'updatedAt'> {}

export class PaymentModel {
	payment: Payment;

	constructor(payment: Payment) {
		this.payment = payment;
	}

	static ToDomain(DTO: PaymentDto): Payment {
		return {
			id: DTO.id,
			payDate: DTO.pay_date,
			paymentDate: DTO.payment_date,
			quotaNumber: DTO.quota_number,
			value: DTO.value,
			creditValue: DTO.credit_value,
			status: DTO.status,
			loanId: DTO.loan_id,
			pendingQuotas: DTO.pending_quotas,
			canceledQuotas: DTO.canceled_quotas,
			agreedQuotas: DTO.agreed_quotas,
			totalDefault: DTO.total_default,
			valueCapital: DTO.value_capital,
			valueQuotaFixed: DTO.value_quota_fixed,
			applied: DTO.applied,
			paymentMethod: DTO.payment_method,
			valueTotalLoan: DTO.value_total_loan,
			clientId: DTO.client_id,
			routeId: DTO.route_id,
			clientFullName: DTO.client_full_name,
			active: DTO.active,
			createdAt: DTO.created_at,
			updatedAt: DTO.updated_at,
		};
	}

	static ToDomainBasic(DTO: PaymentBasicDto): PaymentBasic {
		return {
			active: DTO.active,
			createdAt: DTO.created_at,
			updatedAt: DTO.updated_at,
			id: DTO.id,
			creditValue: DTO.credit_value,
			loanId: DTO.loan_id,
			payDate: DTO.pay_date,
			paymentDate: DTO.payment_date,
			quotaNumber: DTO.quota_number,
			status: DTO.status,
			value: DTO.value,
		};
	}
}