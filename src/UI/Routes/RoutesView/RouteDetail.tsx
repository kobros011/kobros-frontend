import { CurrencyProvider } from '@/infrastructure/hooks/useMoney';
import { FC } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
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
	const [searchParams] = useSearchParams();

	const { hasRouteCashAccess } = getPermission(typeUser);

	if (!id || !hasRouteCashAccess) {
		return <FormRoute readonly={readonly} />;
	}

	const isCashTab = pathname.endsWith('/caja');
	const activeKey = isCashTab ? 'cash' : 'data';

	// La pestaña "Datos" codifica el modo en la ruta (:id vs :id/editar), pero "Caja"
	// comparte una única ruta (:id/caja): se usa un query param para no perder si se
	// llegó desde Ver o Editar al cambiar de pestaña (sobrevive incluso a un refresh).
	const modeParam = searchParams.get('modo');
	const effectiveReadonly = isCashTab
		? (modeParam ? modeParam === 'ver' : readonly)
		: readonly;

	const onChange = (key: string) => {
		if (key === 'cash') {
			void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}/${id}/caja?modo=${effectiveReadonly ? 'ver' : 'editar'}`);
		} else {
			void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}/${id}${effectiveReadonly ? '' : '/editar'}`);
		}
	};

	return (
		<Card
			title={effectiveReadonly ? 'Ver ruta' : 'Actualizar ruta'}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Tabs
				activeKey={activeKey}
				onChange={onChange}
				items={[
					{ key: 'data', label: 'Datos de la ruta', children: <FormRoute readonly={effectiveReadonly} bare /> },
					{ key: 'cash', label: 'Caja', children: <CurrencyProvider routeId={id}><RouteCash routeId={id} readonly={effectiveReadonly} /></CurrencyProvider> },
				]}
			/>
		</Card>
	);
};

export default RouteDetail;
