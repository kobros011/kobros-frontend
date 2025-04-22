import axios from 'axios';
import { LoginData, LoginJwtDTO } from '../dto/LoginDto';
import { ImplementationBase } from './base';
import { LoginJwtModel } from '@/domain/Login';

export class ImplementationLoginJwtRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/auth/';

	async login(data: LoginData) {
		const newData = {
			...data,
			grant_type: 'password',
		};
		const response = await axios.post<LoginJwtDTO>(this.buildUrl({ method: 'login' }), newData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

		return {
			...response,
			data: LoginJwtModel.ToDomain(response?.data),
		};
	}

	async refreshToken(token: string) {
		const response = await axios.post<LoginJwtDTO>(this.buildUrl({ method: 'refresh' }) + `?token=${token}`);

		return {
			...response,
			data: LoginJwtModel.ToDomain(response?.data),
		};
	}
}

export const repository = new ImplementationLoginJwtRepository();