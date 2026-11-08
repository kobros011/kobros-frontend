import { BaseDto } from './BaseDto';

export interface RouteDto extends BaseDto {
	initial_value: string
	initial_expense: string
	name: string
	opening_date: string
	brand_id: string
	allowed_users_ids: string[]
	loans_number: number
	currency: string
}