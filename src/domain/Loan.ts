import { LoanDto, LoanFullDTO, LoanFullReadDTO } from '@/infrastructure/dto/LoanDto';
import { BaseDomain } from './BaseDomain';

export interface Loan extends BaseDomain {
	loanNumber: number,
	initialDate: string,
	endDate: string,
	valueQuotaFixed: string,
	agreedQuotas: number,
	pendingQuotas?: number,
	totalDefault?: string,
	canceledQuotas?: number,
	dateFirstQuota: string,
	paymentMethod: string,
	fixedPaymentDay?: number,
	valueCapital: string,
	valueUtilityLoan: string,
	valueTotalLoan: string,
	interestRate: string,
	clientrouteId?: string
}

export interface LoanFull extends Partial<Loan> {
	currentAddress?: string,
	currentMobile?: string,
	newOrder?: number,
	valuePayment?: string
	clientId?: string
}
export interface LoanFullRead extends Partial<Loan> {
	fullName?: string,
	idDocument?: string,
	currentAddress?: string,
	currentMobile?: string
	routeName?: string
	order?: number
	clientId?: string
	routeId?: string
}

export class LoanModel {
	loan: Loan;

	constructor(loan: Loan) {
		this.loan = loan;
	}

	static ToDomain(DTO: LoanDto): Loan {
		return {
			id: DTO.id,
			loanNumber: DTO.loan_number,
			initialDate: DTO.initial_date,
			endDate: DTO.end_date,
			valueQuotaFixed: DTO.value_quota_fixed,
			agreedQuotas: DTO.agreed_quotas,
			dateFirstQuota: DTO.date_first_quota,
			paymentMethod: DTO.payment_method,
			fixedPaymentDay: DTO.fixed_payment_day,
			valueCapital: DTO.value_capital,
			valueUtilityLoan: DTO.value_utility_loan,
			valueTotalLoan: DTO.value_total_loan,
			interestRate: DTO.interest_rate,
			clientrouteId: DTO.clientroute_id,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}

	static ToDto(domain: Loan): Partial<LoanDto> {
		return {
			loan_number: domain.loanNumber,
			initial_date: domain.initialDate,
			end_date: domain.endDate,
			value_quota_fixed: domain.valueQuotaFixed,
			agreed_quotas: domain.agreedQuotas,
			date_first_quota: domain.dateFirstQuota,
			payment_method: domain.paymentMethod,
			fixed_payment_day: domain.fixedPaymentDay,
			value_capital: domain.valueCapital,
			value_utility_loan: domain.valueUtilityLoan,
			value_total_loan: domain.valueTotalLoan,
			interest_rate: domain.interestRate,
			clientroute_id: domain.clientrouteId,
			...(domain.id ? { id: domain.id } : {}),
		};
	}

	static FullToDomain(DTO: LoanFullDTO): LoanFull {
		return {
			id: DTO.id,
			loanNumber: DTO.loan_number,
			initialDate: DTO.initial_date,
			endDate: DTO.end_date,
			valueQuotaFixed: DTO.value_quota_fixed,
			agreedQuotas: DTO.agreed_quotas,
			dateFirstQuota: DTO.date_first_quota,
			paymentMethod: DTO.payment_method,
			fixedPaymentDay: DTO.fixed_payment_day,
			valueCapital: DTO.value_capital,
			valueUtilityLoan: DTO.value_utility_loan,
			valueTotalLoan: DTO.value_total_loan,
			interestRate: DTO.interest_rate,
			clientrouteId: DTO.clientroute_id,
			currentMobile: DTO.current_mobile,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}

	static FullReadToDomain(DTO: LoanFullReadDTO): LoanFullRead {
		return {
			id: DTO.id,
			loanNumber: DTO.loan_number,
			initialDate: DTO.initial_date,
			endDate: DTO.end_date,
			valueQuotaFixed: DTO.value_quota_fixed,
			agreedQuotas: DTO.agreed_quotas,
			dateFirstQuota: DTO.date_first_quota,
			paymentMethod: DTO.payment_method,
			valueCapital: DTO.value_capital,
			valueUtilityLoan: DTO.value_utility_loan,
			valueTotalLoan: DTO.value_total_loan,
			interestRate: DTO.interest_rate,
			clientrouteId: DTO.clientroute_id,
			canceledQuotas: DTO.canceled_quotas,
			pendingQuotas: DTO.pending_quotas,
			totalDefault: DTO.total_default,
			currentAddress: DTO.client_current_address,
			currentMobile: DTO.client_current_mobile,
			fullName: DTO.client_fullname,
			idDocument: DTO.client_id_document,
			clientId: DTO.client_id,
			routeId: DTO.route_id,
			order: DTO.order,
			routeName: DTO.route_name,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}

	static FullToDto(domain: LoanFull): Partial<LoanFullDTO> {
		return {
			loan_number: domain.loanNumber,
			initial_date: domain.initialDate,
			end_date: domain.endDate,
			value_quota_fixed: domain.valueQuotaFixed,
			agreed_quotas: domain.agreedQuotas,
			date_first_quota: domain.dateFirstQuota,
			payment_method: domain.paymentMethod,
			fixed_payment_day: domain.fixedPaymentDay,
			value_capital: domain.valueCapital,
			value_utility_loan: domain.valueUtilityLoan,
			value_total_loan: domain.valueTotalLoan,
			interest_rate: domain.interestRate,
			clientroute_id: domain.clientrouteId,
			current_address: domain.currentAddress,
			current_mobile: domain.currentMobile,
			value_payment: domain.valuePayment,
			new_order: domain.newOrder,
			client_id: domain.clientId,
			...(domain.id ? { id: domain.id } : {}),
		};
	}
}