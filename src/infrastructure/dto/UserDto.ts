import { TypeUser } from '@/constants/types';
import { BaseDto } from './BaseDto';

/** Ruta de la marca del usuario y si está asignado; los pendientes solo cuentan en las asignadas. */
export interface UserRouteDto {
	route_id: string
	name: string
	currency: string
	active: boolean
	assigned: boolean
	pending_payments: number
	open_liquidations: number
}

export interface UserRouteRemovedDto {
	removed: boolean
	pending_payments: number
	open_liquidations: number
}

export interface UserDto extends BaseDto {
	username: string
	email?: string
	full_name: string
	document_id: string
	linking_date: string,
	address?: string,
	phone?: string,
	mobile?: string,
	city?: string,
	department?: string,
	type_user: TypeUser
	brand_id: string
	password?: string
}