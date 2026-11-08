import routePaths from '@/constants/routePaths';
import { TypeUser } from '@/constants/types';

/** Normaliza type_user del API (código "01" o nombre "dev"). */
export function normalizeTypeUser(value: TypeUser | string | undefined): TypeUser | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}
	const raw = String(value);
	if (Object.values(TypeUser).includes(raw as TypeUser)) {
		return raw as TypeUser;
	}
	const byName: Record<string, TypeUser> = {
		dev: TypeUser.dev,
		super: TypeUser.super,
		admin: TypeUser.admin,
		partner: TypeUser.partner,
		collector: TypeUser.collector,
	};
	return byName[raw.toLowerCase()];
}

/** Ruta relativa bajo /home/ tras iniciar sesión (no usa inicio). */
export function getDefaultHomeRoute(typeUser: TypeUser | string | undefined): string {
	const role = normalizeTypeUser(typeUser);

	switch (role) {
		case TypeUser.dev:
			return routePaths.BRANDS;
		case TypeUser.super:
			return routePaths.ROUTES;
		case TypeUser.admin:
			return routePaths.USERS;
		case TypeUser.partner:
			return routePaths.PAYMENTS;
		case TypeUser.collector:
			return routePaths.COLLECTION_TODAY;
		default:
			return routePaths.COLLECTION_TODAY;
	}
}

export function buildDefaultHomePath(typeUser: TypeUser | string | undefined): string {
	const segment = getDefaultHomeRoute(typeUser);
	return `/${routePaths.DEFAULT_HOME}/${segment}`;
}
