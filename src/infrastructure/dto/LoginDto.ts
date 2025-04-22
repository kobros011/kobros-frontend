export interface LoginJwtDTO {
	access_token: string,
	refresh_token: string,
	token_type: string
}

export type LoginData = {
	username: string,
	password: string,
};