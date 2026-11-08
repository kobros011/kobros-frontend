/** Tipos 1:1 con `GET /payments/history` (snake_case; todo el cálculo de estado/saldo/mora viene del servidor). */

export type PaymentHistoryStatus = 'pagado' | 'pendiente' | 'mora';

export interface PaymentHistoryItemDto {
	id: string;
	quota_number: number;
	pay_date: string;
	payment_date: string | null;
	value: number;
	applied: number;
	balance: number;
	status: PaymentHistoryStatus;
	days_overdue: number;
	paid_late_days: number;
	collected_by_id: string | null;
	collected_by_name: string | null;
	can_pay: boolean;
}

export interface PaymentHistorySummaryDto {
	total_quotas: number;
	paid: number;
	pending: number;
	overdue: number;
	total_due: number;
	total_paid: number;
	total_balance: number;
	paid_percent: number;
}

export interface PaymentHistoryPageDto {
	items: PaymentHistoryItemDto[];
	total: number;
	page: number;
	page_size: number;
	pages: number;
	summary: PaymentHistorySummaryDto;
}
