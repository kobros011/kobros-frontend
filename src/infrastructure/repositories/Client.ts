import axios from 'axios';
import { ImplementationBase } from './base';
import { Client, ClientModel } from '@/domain/Client';
import { ClientDto } from '../dto/ClientDto';
import { Filters, FiltersModel } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';
import { mapPage, toPageQuery } from '../utils/pagination';

export class ImplementationClientRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/clients/';

	async getClient(id: string) {
		const response = await axios.get<ClientDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: ClientModel.ToDomain(response?.data),
		};
	}

	async getClientMoreInfo(id: string, route_id: string) {
		const response = await axios.get<ClientDto>(this.buildUrl({ id: id, method: 'more_info' }), { params: { route_id: route_id } });

		return {
			...response,
			data: ClientModel.ToDomain(response?.data),
		};
	}

	async getListClients(filters: Partial<Filters>) {

		const response = await axios.get<ClientDto[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });
		return {
			...response,
			clients: response?.data?.map(client => ClientModel.ToDomain(client)),
		};
	}

	async getPage(filters: Partial<Filters>, pagination: PaginationParams) {
		const response = await axios.get<PageDto<ClientDto>>(this.baseUrl, {
			params: { ...FiltersModel.toDto(filters), ...toPageQuery(pagination) },
		});

		return { ...response, page: mapPage(response.data, dto => ClientModel.ToDomain(dto)) };
	}

	async create(data: Partial<Client>) {
		if (!data) return;

		return axios.post<ClientDto>(this.baseUrl, ClientModel.ToDto(data as Client));	
	}

	async update(data: Partial<Client>) {
		if (!data || !data.id) return;

		return axios.put<ClientDto>(this.buildUrl({ id: data.id }), ClientModel.ToDto(data as Client));	
	}

	async delete(client_id: string) {
		return axios.put(this.buildUrl({ id: client_id, method: 'toggle' }));	
	}
}

export const repository = new ImplementationClientRepository();