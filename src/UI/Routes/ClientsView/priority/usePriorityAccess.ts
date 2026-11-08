import { TypeUser } from '@/constants/types';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';

/** Solo dev, super y administrador cambian prioridades; cobrador y socio las ven. */
export const useCanManagePriority = () => {
	const { typeUser } = useUserStore(state => state.user);
	const role = normalizeTypeUser(typeUser) ?? TypeUser.collector;
	return [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);
};
