import { TypeUser } from '@/constants/types';
import { BaseDto } from './BaseDto';

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