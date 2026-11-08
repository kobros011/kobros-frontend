import { BaseDto } from './BaseDto';

export interface ClientRouteDto extends BaseDto {
	full_name: string
	id_document: string
	client_id: string
	route_id: string
	route_name?: string
	neighborhood?: string
	current_mobile?: string
	client_active?: boolean
	order?: number,
}