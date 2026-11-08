import axios from 'axios';
import { ImplementationBase } from './base';
import { ClientRouteModel } from '@/domain/ClientRoute';
import { ClientRouteDto } from '../dto/ClientRouteDto';

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

	/** Mueve un cliente a `position` dentro de su ruta (los demás se recorren). Devuelve la ruta ya ordenada. */
	async move(clientRouteId: string, position: number) {
		const response = await axios.put<ClientRouteDto[]>(`${this.baseUrl}${clientRouteId}/order`, { position });
		return response?.data?.map(item => ClientRouteModel.ToDomain(item));
	}

	/** Fija el orden completo de la ruta (`orderedIds` = todos sus clientroute_id activos). */
	async reorder(routeId: string, orderedIds: string[]) {
		const response = await axios.put<ClientRouteDto[]>(`${this.baseUrl}reorder`, { route_id: routeId, ordered_ids: orderedIds });
		return response?.data?.map(item => ClientRouteModel.ToDomain(item));
	}

	/** Mueve varios clientes de la ruta al inicio, al final o a una posición, conservando su orden relativo. */
	async bulkMove(routeId: string, clientRouteIds: string[], target: 'start' | 'end' | 'position', position?: number) {
		const response = await axios.post<ClientRouteDto[]>(`${this.baseUrl}bulk-move`, {
			route_id: routeId, clientroute_ids: clientRouteIds, target, ...(target === 'position' ? { position } : {}),
		});
		return response?.data?.map(item => ClientRouteModel.ToDomain(item));
	}
}

export const repository = new ImplementationClientRouteRepository();