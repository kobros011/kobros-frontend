import { RouteDto } from '@/infrastructure/dto/RouteDto';
import { BaseDomain } from './BaseDomain';

export interface Route extends BaseDomain {
	initialValue: string
	initialExpense: string
	name: string
	openingDate: string
	brandId: string
	allowedUsersIds: string[]
	loansNumber: number
}

export class RouteModel {
	route: Route;

	constructor(route: Route) {
		this.route = route;
	}

	static ToDomain(DTO: RouteDto): Route {	
		return {
			id: DTO.id,
			name: DTO.name,
			initialExpense: DTO.initial_expense,
			initialValue: DTO.initial_value,
			openingDate: DTO.opening_date,
			brandId: DTO.brand_id,
			allowedUsersIds: DTO.allowed_users_ids ?? [],
			loansNumber: DTO.loans_number,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}

	static ToDto(domain: Route): Partial<RouteDto> {	
		return {
			name: domain.name,
			initial_expense: domain.initialExpense,
			initial_value: domain.initialValue,
			opening_date: domain.openingDate,
			brand_id: domain.brandId,
			allowed_users_ids: domain.allowedUsersIds ?? [],
			...(domain.id ? { id: domain.id } : {}),
		};
	} 
}