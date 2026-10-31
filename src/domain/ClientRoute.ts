import { ClientRouteDto } from '@/infrastructure/dto/ClientRouteDTO';
import { BaseDomain } from './BaseDomain';

export interface ClientRoute extends BaseDomain {
	fullName: string
	idDocument: string
	clientId: string
	routeId: string
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
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}
}