import axios from 'axios';
import { ImplementationBase } from './base';
import { User, UserModel } from '@/domain/User';
import { UserDto, UserRouteDto, UserRouteRemovedDto } from '../dto/UserDto';
import { Filters, FiltersModel } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';
import { mapPage, toPageQuery } from '../utils/pagination';

export class ImplementationUserRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/users/';

	async getUser(id: string) {
		const response = await axios.get<UserDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: UserModel.ToDomain(response?.data),
		};
	}

	async getMe() {
		const response = await axios.get<UserDto>('/auth/me');
		return {
			...response,
			data: UserModel.ToDomain(response?.data),
		};
	}

	async getList(filters: Partial<Filters>) {
		const response = await axios.get<UserDto[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });

		return {
			...response,
			data: response?.data?.map(route => UserModel.ToDomain(route)),
		};
	}

	async getPage(filters: Partial<Filters>, pagination: PaginationParams) {
		const response = await axios.get<PageDto<UserDto>>(this.baseUrl, {
			params: { ...FiltersModel.toDto(filters), ...toPageQuery(pagination) },
		});

		return { ...response, page: mapPage(response.data, dto => UserModel.ToDomain(dto)) };
	}

	async create(data: Partial<User>) {
		if (!data) return;

		return axios.post<UserDto>(this.baseUrl, UserModel.ToDto(data as User));	
	}

	async update(data: Partial<User>) {
		if (!data || !data.id) return;

		return axios.put<UserDto>(this.buildUrl({ id: data.id }), UserModel.ToDto(data as User));	
	}

	async getRoutes(userId: string) {
		const response = await axios.get<UserRouteDto[]>(`${this.baseUrl}${userId}/routes`);
		return response.data.map(route => UserModel.routeToDomain(route));
	}

	async assignRoute(userId: string, routeId: string) {
		await axios.put(`${this.baseUrl}${userId}/routes/${routeId}`);
	}

	async removeRoute(userId: string, routeId: string) {
		const response = await axios.delete<UserRouteRemovedDto>(`${this.baseUrl}${userId}/routes/${routeId}`);
		return response.data;
	}

	async delete(user_id: string) {
		return axios.put(this.buildUrl({ id: user_id, method: 'toggle' }));	
	}

	async setPassword(userId: string, password: string) {
		return axios.put<UserDto>(this.buildUrl({ id: userId, method: 'password' }), { password });
	}

	async sendPasswordReset(userId: string) {
		return axios.post(this.buildUrl({ id: userId, method: 'send-password-reset' }));
	}
}

export const repository = new ImplementationUserRepository();