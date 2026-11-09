import { BaseDto } from './BaseDto';

export interface ClientContactDto {
	id?: string
	kind: 'fiador' | 'referencia'
	name: string
	phone: string
	address?: string | null
	position?: number
	is_primary?: boolean
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
	contacts?: ClientContactDto[]
	active_loans_count?: number
	loan_id?: string | null
	loan_number?: number | null
}