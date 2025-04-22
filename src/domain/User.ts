import { UserDto } from '@/infrastructure/dto/UserDto';
import { BaseDomain } from './BaseDomain';

export interface User extends BaseDomain {
	username: string
	name: string
	lastName: string
	typeUser: string
}

export class UserModel {
	user: User;

	constructor(user: User) {
		this.user = user;
	}

	static ToDomain(DTO: UserDto): User {
		
		return {
			id: DTO.id,
			name: DTO.name,
			username: DTO.username,
			lastName: DTO.last_name,
			typeUser: DTO.type_user,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	} 
}