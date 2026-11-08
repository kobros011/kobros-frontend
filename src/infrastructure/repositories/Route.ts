import axios from 'axios';
import { ImplementationBase } from './base';
import { Route, RouteModel } from '@/domain/Route';
import { RouteDto } from '../dto/RouteDto';
import { Filters, FiltersModel } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';
import { mapPage, toPageQuery } from '../utils/pagination';

export class ImplementationRouteRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/routes/';

	async getRoute(id: string) {
		const response = await axios.get<RouteDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: RouteModel.ToDomain(response?.data),
		};
	}

	async getList(filters: Partial<Filters>) {
		const response = await axios.get<RouteDto[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });

		return {
			...response,
			data: response?.data?.map(route => RouteModel.ToDomain(route)),
		};
	}

	async getPage(filters: Partial<Filters>, pagination: PaginationParams) {
		const response = await axios.get<PageDto<RouteDto>>(this.baseUrl, {
			params: { ...FiltersModel.toDto(filters), ...toPageQuery(pagination) },
		});

		return { ...response, page: mapPage(response.data, dto => RouteModel.ToDomain(dto)) };
	}

	async create(data: Partial<Route>) {
		if (!data) return;

		return axios.post<RouteDto>(this.baseUrl, RouteModel.ToDto(data as Route));	
	}

	async update(data: Partial<Route>) {
		if (!data || !data.id) return;

		return axios.put<RouteDto>(this.buildUrl({ id: data.id }), RouteModel.ToDto(data as Route));	
	}

	async delete(route_id: string) {
		return axios.put(this.buildUrl({ id: route_id, method: 'toggle' }));	
	}
}

export const repository = new ImplementationRouteRepository();