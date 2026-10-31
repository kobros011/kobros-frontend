import { UserDto } from '@/infrastructure/dto/UserDto';
import { BaseDomain } from './BaseDomain';
import { TypeUser } from '@/constants/types';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';

export interface User extends BaseDomain {
	username: string
	email?: string
	fullName: string
	documentId: string
	linkingDate: string,
	address?: string,
	phone?: string,
	mobile?: string,
	city?: string,
	department?: string,
	typeUser: TypeUser
	brandId: string
	password?: string
}

export class UserModel {
	user: User;

	constructor(user: User) {
		this.user = user;
	}

	static ToDomain(DTO: UserDto): User {
		
		return {
			id: DTO.id,
			fullName: DTO.full_name,
			documentId: DTO.document_id,
			linkingDate: DTO.linking_date,
			address: DTO.address,
			phone: DTO.phone,
			mobile: DTO.mobile,
			city: DTO.city,
			department: DTO.department,
			username: DTO.username,
			email: DTO.email,
			typeUser: normalizeTypeUser(DTO.type_user) ?? TypeUser.collector,
			brandId: DTO.brand_id,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}
 
	static ToDto(domain: User): Partial<UserDto> {
		
		return {
			id: domain.id,
			full_name: domain.fullName,
			username: domain.username,
			email: domain.email || undefined,
			type_user: domain.typeUser,
			document_id: domain.documentId,
			linking_date: domain.linkingDate,
			address: domain.address,
			phone: domain.phone,
			mobile: domain.mobile,
			city: domain.city,
			department: domain.department,
			brand_id: domain.brandId,
			...(domain.id ? { id: domain.id } : {}),
			...(domain.password ? { password: domain.password } : {}),
		};
	} 
}