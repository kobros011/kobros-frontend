import { TypeUser } from '@/constants/types';

export const getNameTypeUser = (typeUser: TypeUser) => {
	if (typeUser == TypeUser.admin) return 'Administrador';
	if (typeUser == TypeUser.partner) return 'Socio';
	if (typeUser == TypeUser.collector) return 'Recaudador';
	return '';
};