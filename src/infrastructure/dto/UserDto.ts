import { BaseDto } from './BaseDto';

export interface UserDto extends BaseDto {
	username: string
	name: string
	last_name: string
	type_user: string
}