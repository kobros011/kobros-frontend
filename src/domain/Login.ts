import { LoginJwtDTO } from '@/infrastructure/dto/LoginDto';

export interface LoginJwt {
	accessToken: string,
	refreshToken: string,
	tokenType: string
}

export class LoginJwtModel {
	jwt: LoginJwt;

	constructor(jwt: LoginJwt) {
		this.jwt = jwt;
	}

	static ToDomain(DTO: LoginJwtDTO): LoginJwt {
		return {
			accessToken: DTO.access_token,
			refreshToken: DTO.refresh_token,
			tokenType: DTO.token_type,
		};
	}
}