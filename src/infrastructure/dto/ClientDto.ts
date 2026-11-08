import { BaseDto } from './BaseDto';

export interface ClientReferenceDto {
	id?: string
	name: string
	address?: string
	phone?: string
}

export interface ClientRouteInfoDto {
	route_id: string
	route_name: string
	clientroute_id: string
	order: number
	route_total: number
}

export interface ClientDto extends BaseDto {
	full_name: string
	id_document: string
	current_address: string
	current_phone: string
	current_mobile: string
	neighborhood: string
	linking_date: string
	beak: number
	brand_id: string
	routes_ids?: string[]
	routes?: ClientRouteInfoDto[]
	route_id?: string,
	route_name?: string,
	order?: number,
	guarantor_name?: string | null
	guarantor_cedula?: string | null
	guarantor_phone?: string | null
	guarantor_address?: string | null
	references?: ClientReferenceDto[]
	active_loans_count?: number
}