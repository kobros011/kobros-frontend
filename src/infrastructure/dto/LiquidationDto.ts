import { PageDto } from './PageDto';

/** Tipos 1:1 con `/liquidations` (snake_case). El servidor calcula todo; el cliente solo envía lo que digita quien cierra. */

export type LiquidationStatus = 'pendiente' | 'confirmada' | 'reabierta';

export interface ExpenseLineDto {
	id: string;
	name: string;
	concept: string | null;
	value: number;
}

export interface PaymentLineDto {
	id: string;
	client_name: string;
	loan_number: number;
	quota_number: number;
	pay_date: string;
	value: number;
	applied: number;
}

export interface NewLoanLineDto {
	id: string;
	loan_number: number;
	client_name: string;
	value_capital: number;
	value_total_loan: number;
	agreed_quotas: number;
	value_quota_fixed: number;
	payment_method: string;
}

export interface ClosingFiguresDto {
	goal: number;
	collected_total: number;
	receipts_count: number;
	collected_due_today: number;
	collected_overdue: number;
	partial_count: number;
	beak_generated: number;
	expenses_total: number;
	new_loans_total: number;
	new_loans_count: number;
}

export interface LiquidationPreviewDto extends ClosingFiguresDto {
	route_id: string;
	route_name: string;
	collector_id: string | null;
	collector_name: string | null;
	date: string;
	suggested_base: number;
	expected_cash: number;
	progress_percent: number;
	expenses: ExpenseLineDto[];
	new_loans: NewLoanLineDto[];
	existing_liquidation_id: string | null;
	existing_status: LiquidationStatus | null;
}

export interface LiquidationDto {
	id: string;
	date: string;
	route_id: string;
	route_name: string;
	collector_id: string | null;
	collector_name: string | null;
	today_collection_goal: number;
	value_base_delivered: number;
	total_value_charged: number;
	total_value_expenses: number;
	value_new_loans: number;
	cash_delivered: number | null;
	expected_cash: number | null;
	difference: number | null;
	receipts_count: number;
	new_loans_count: number;
	beak_generated: number;
	note: string | null;
	status: LiquidationStatus;
	admin_confirmed_at: string | null;
	admin_confirmed_by: string | null;
	confirmed_by_name: string | null;
	reopened_at: string | null;
	active: boolean;
	created_at: string;
}

export interface LiquidationListItemDto extends LiquidationDto {
	outdated: boolean;
	outdated_amount: number;
	late_receipts: number;
}

export interface LiquidationTotalsDto {
	count: number;
	collected: number;
	expenses: number;
	new_loans: number;
	new_loans_count: number;
	expected: number;
	delivered: number;
	difference: number;
}

export interface LiquidationPageDto extends PageDto<LiquidationListItemDto> {
	summary: LiquidationTotalsDto;
}

export interface LiquidationDetailDto extends LiquidationDto {
	outdated: boolean;
	current_total_charged: number;
	current_total_expenses: number;
	current_new_loans: number;
	payments: PaymentLineDto[];
	expenses: ExpenseLineDto[];
	new_loans: NewLoanLineDto[];
}

export interface LiquidationCreateDto {
	route_id: string;
	date: string;
	value_base_delivered: number;
	cash_delivered: number;
	note?: string;
	collector_id?: string;
}

export interface LiquidationPreviewParams {
	route_id: string;
	date: string;
	collector_id?: string;
}

export interface LiquidationListFilters {
	currency?: string
	route_id?: string;
	collector_id?: string;
	date_from?: string;
	date_to?: string;
	status?: LiquidationStatus;
}
