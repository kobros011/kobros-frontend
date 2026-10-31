import { BaseDto } from './BaseDto';

export interface LoanDto extends BaseDto {
	loan_number: number,
	initial_date: string,
	end_date: string,
	value_quota_fixed: string,
	agreed_quotas: number,
	pending_quotas?: number,
	total_default?: string,
	canceled_quotas?: number,
	date_first_quota: string,
	payment_method: string,
	fixed_payment_day?: number,
	value_capital: string,
	value_utility_loan: string,
	value_total_loan: string,
	interest_rate: string,
	agreedQuotas: number,
	clientroute_id?: string
}

export interface LoanFullDTO extends Partial<LoanDto> {
	current_address?: string,
	current_mobile?: string,
	new_order?: number,
	value_payment?: string
	client_id?: string
}

export interface LoanFullReadDTO extends Partial<LoanDto> {
	client_fullname?: string,
	client_id_document?: string,
	client_current_address?: string,
	client_current_mobile?: string
	route_name?: string
	order?: number
	client_id?: string
	route_id?: string
}