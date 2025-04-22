import axios from 'axios';
import { ImplementationBase } from './base';
import { UserModel } from '@/domain/User';
import { UserDto } from '../dto/UserDto';

export class ImplementationUserRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/users/';

	async getUser(id: string) {
		const response = await axios.get<UserDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: UserModel.ToDomain(response?.data),
		};
	}
}

export const repository = new ImplementationUserRepository();