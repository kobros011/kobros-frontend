import { FC } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, Tabs } from 'antd';
import routePaths from '@/constants/routePaths';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getPermission } from '@/infrastructure/utils/Permissions';
import FormRoute from './Form';
import RouteCash from './RouteCash';

const RouteDetail: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { typeUser } = useUserStore(state => state.user);

	const { hasRouteCashAccess } = getPermission(typeUser);

	if (!id || !hasRouteCashAccess) {
		return <FormRoute readonly={readonly} />;
	}

	const isCashTab = pathname.endsWith('/caja');
	const activeKey = isCashTab ? 'cash' : 'data';
	const editOrSeeSuffix = readonly ? '' : '/editar';

	const onChange = (key: string) => {
		if (key === 'cash') {
			void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}/${id}/caja`);
		} else {
			void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}/${id}${editOrSeeSuffix}`);
		}
	};

	return (
		<Card
			title={readonly ? 'Ver ruta' : 'Actualizar ruta'}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Tabs
				activeKey={activeKey}
				onChange={onChange}
				items={[
					{ key: 'data', label: 'Datos de la ruta', children: <FormRoute readonly={readonly} bare /> },
					{ key: 'cash', label: 'Caja', children: <RouteCash routeId={id} /> },
				]}
			/>
		</Card>
	);
};

export default RouteDetail;
