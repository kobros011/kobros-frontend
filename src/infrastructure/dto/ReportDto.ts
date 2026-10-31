export interface PortfolioItemDto {
	client_id: string
	client_name: string
	loan_id: string
	loan_number: number
	route_id: string
	route_name: string
	value_total_loan: number
	total_paid: number
	balance: number
	end_date: string
	payment_method: string
}

export interface DelinquencyItemDto {
	client_id: string
	client_name: string
	loan_id: string
	loan_number: number
	route_id: string
	route_name: string
	value_total_loan: number
	total_paid: number
	balance: number
	end_date: string
	days_overdue: number
}

export interface PaymentHistoryItemDto {
	payment_id: string
	loan_id: string
	loan_number: number
	quota_number: number
	pay_date: string
	payment_date: string | null
	value: number
	applied: number
	status: string
}
