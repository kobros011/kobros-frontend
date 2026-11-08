/** Tipos 1:1 con `GET /reports/dashboard/*` y `GET /reports/period` (snake_case; porcentajes en escala 0–100). */

export type Severity = 'critical' | 'warning';
export type PeriodMode = 'weekly' | 'annual';

export interface DashboardRouteFilterDto {
	id: string
	name: string
	collector_ids: string[]
}

export interface DashboardCollectorFilterDto {
	id: string
	full_name: string
}

export interface DashboardFiltersDto {
	routes: DashboardRouteFilterDto[]
	collectors: DashboardCollectorFilterDto[]
}

export interface DashboardKpisDto {
	portfolio_total: number
	portfolio_loans: number
	delinquency_total: number
	delinquency_loans: number
	delinquency_rate: number
	total_lent: number
	total_paid: number
	effectiveness: number
	clients_active: number
	clients_inactive: number
	active_rate: number
	routes_total: number
	routes_with_loans: number
	collectors_in_field: number
	critical_clients: number
}

export interface DailyPointDto {
	date: string
	collected: number
	goal: number
}

export interface CompositionDto {
	up_to_date: number
	mild: number
	critical: number
}

export interface RouteRowDto {
	route_id: string
	route_name: string
	collector_names: string[]
	active: number
	late: number
	rate: number
}

export interface CollectorRowDto {
	collector_id: string
	full_name: string
	route_names: string[]
	goal: number
	collected: number
	percent: number
}

export interface DashboardSummaryDto {
	kpis: DashboardKpisDto
	daily: DailyPointDto[]
	composition: CompositionDto
	by_route: RouteRowDto[]
	by_collector: CollectorRowDto[]
	average_goal: number
	critical_days: number
}

export interface CriticalLoanDto {
	client_id: string
	client_name: string
	client_document: string | null
	route_id: string
	route_name: string
	collector_names: string[]
	loan_id: string
	loan_number: number
	loan_balance: number
	overdue_amount: number
	overdue_quotas: number
	overdue_since: string
	days_overdue: number
	severity: Severity
}

export interface PeriodBucketDto {
	key: string
	date: string
	collected: number
	expenses: number
	profit: number
}

export interface PeriodReportDto {
	mode: PeriodMode
	start: string
	end: string
	latest_movement_date: string | null
	buckets: PeriodBucketDto[]
	totals: { collected: number; expenses: number; profit: number; margin: number }
}

export interface DashboardParams {
	route_id?: string
	collector_id?: string
}
