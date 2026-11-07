import axios from 'axios';
import { RouteCashSummaryDto, RouteMovementCreateDto, RouteMovementDto } from '../dto/RouteMovementDto';
import { RouteCashSummary, RouteMovementModel } from '@/domain/RouteMovement';
import { PaginationParams } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';
import { mapPage } from '../utils/pagination';
import { ImplementationBase } from './base';

export class ImplementationRouteMovementRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/route-movements/';

	async getList(routeId: string, { page, pageSize }: PaginationParams) {
		const response = await axios.get<PageDto<RouteMovementDto>>(this.baseUrl, {
			params: { route_id: routeId, page, page_size: pageSize },
		});
		return { ...response, page: mapPage(response.data, item => RouteMovementModel.ToDomain(item)) };
	}

	async getSummary(routeId: string) {
		const response = await axios.get<RouteCashSummaryDto>(`${this.baseUrl}summary`, { params: { route_id: routeId } });
		const dto = response.data;
		const summary: RouteCashSummary = {
			initialValue: Number(dto.initial_value),
			ingresos: Number(dto.ingresos),
			retiros: Number(dto.retiros),
			cobros: Number(dto.cobros),
			gastos: Number(dto.gastos),
			desembolsos: Number(dto.desembolsos),
			saldo: Number(dto.saldo),
		};
		return { ...response, summary };
	}

	async create(data: RouteMovementCreateDto) {
		const response = await axios.post<RouteMovementDto>(this.baseUrl, data);
		return { ...response, movement: RouteMovementModel.ToDomain(response.data) };
	}
}

export const repository = new ImplementationRouteMovementRepository();
