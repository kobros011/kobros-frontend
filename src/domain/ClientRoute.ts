import { ClientRouteDto } from '@/infrastructure/dto/ClientRouteDto';
import { BaseDomain } from './BaseDomain';

export interface ClientRoute extends BaseDomain {
	fullName: string
	idDocument: string
	clientId: string
	routeId: string
	routeName: string
	neighborhood: string
	currentMobile: string
	clientActive: boolean
	order?: number,
}


export class ClientRouteModel {
	clientRoute: ClientRoute;

	constructor(clientRoute: ClientRoute) {
		this.clientRoute = clientRoute;
	}

	static ToDomain(DTO: ClientRouteDto): ClientRoute {	
		return {
			id: DTO.id,
			fullName: DTO.full_name,
			idDocument: DTO.id_document,
			clientId: DTO.client_id,
			order: DTO.order,
			routeId: DTO.route_id,
			routeName: DTO.route_name ?? '',
			neighborhood: DTO.neighborhood ?? '',
			currentMobile: DTO.current_mobile ?? '',
			clientActive: DTO.client_active ?? true,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}
}