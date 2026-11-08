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
	/** Moneda de la ruta (código ISO); una de las monedas de la marca. */
	currency: string
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
			currency: DTO.currency,
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
			// Solo se envía si se eligió: sin valor el servidor usa la única moneda de la marca (o la actual al editar).
			...(domain.currency ? { currency: domain.currency } : {}),
			...(domain.id ? { id: domain.id } : {}),
		};
	} 
}