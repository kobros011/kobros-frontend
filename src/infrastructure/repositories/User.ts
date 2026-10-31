import axios from 'axios';
import { ImplementationBase } from './base';
import { User, UserModel } from '@/domain/User';
import { UserDto } from '../dto/UserDto';
import { Filters, FiltersModel } from '@/domain/Filters';

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

	async create(data: Partial<User>) {
		if (!data) return;

		return axios.post<UserDto>(this.baseUrl, UserModel.ToDto(data as User));	
	}

	async update(data: Partial<User>) {
		if (!data || !data.id) return;

		return axios.put<UserDto>(this.buildUrl({ id: data.id }), UserModel.ToDto(data as User));	
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