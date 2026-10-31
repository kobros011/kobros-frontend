import { BaseDto } from './BaseDto';

export interface LiquidationDto extends BaseDto {
	date: string;
	today_collection_goal: number;
	value_base_delivered: number;
	total_value_charged: number;
	total_value_expenses: number;
	value_new_loans: number;
	route_id: string;
	collector_id: string | null;
	admin_confirmed_at: string | null;
	admin_confirmed_by: string | null;
}

export interface LiquidationCreateDto {
	date: string;
	today_collection_goal: number;
	value_base_delivered: number;
	value_new_loans: number;
	route_id: string;
	collector_id?: string | null;
}
