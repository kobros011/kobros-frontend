import { PaymentStatus } from '@/constants/types';
import { BaseDto } from './BaseDto';

export interface PaymentDto extends BaseDto {
	pay_date: string,
	payment_date: string | null,
	quota_number: number,
	value: number,
	credit_value: number,
	status: PaymentStatus,
	loan_id: string,
	pending_quotas: number,
	canceled_quotas: number,
	agreed_quotas: number,
	total_default: number,
	value_capital: number,
	value_quota_fixed: number,
	payment_method: string,
	value_total_loan: number,
	applied: number,
	client_id: string,
	route_id: string,
	client_full_name: string
}

export interface PaymentBasicDto extends Pick<PaymentDto, 'id' | 'pay_date' | 'payment_date' | 'quota_number' | 'value' | 'credit_value' | 'status' | 'loan_id' | 'active' | 'created_at' | 'updated_at'> {}