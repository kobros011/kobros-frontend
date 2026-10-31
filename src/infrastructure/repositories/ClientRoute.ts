import axios from 'axios';
import { ImplementationBase } from './base';
import { ClientRouteModel } from '@/domain/ClientRoute';
import { ClientRouteDto } from '../dto/ClientRouteDTO';

export class ImplementationClientRouteRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/clientroute/';

	async getClientRoute(id: string) {
		const response = await axios.get<ClientRouteDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: ClientRouteModel.ToDomain(response?.data),
		};
	}

	async getListClientRoutes(routeId: string) {

		const response = await axios.get<ClientRouteDto[]>(this.baseUrl, { params: { route_id: routeId } });
		return {
			...response,
			clientRoutes: response?.data?.map(clientRoute => ClientRouteModel.ToDomain(clientRoute)),
		};
	}
}

export const repository = new ImplementationClientRouteRepository();