import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import routePaths from './constants/routePaths';
import { Spin } from 'antd';
import BrandCodeVerification from './UI/Routes/BrandCodeVerification';
import useUserStore from './infrastructure/context/User/UserDataStore';
import { getMe } from './infrastructure/querys/User';
import { buildDefaultHomePath, normalizeTypeUser } from './infrastructure/utils/defaultHomeRoute';
import { TypeUser } from './constants/types';
import LoadingComponent from './UI/Components/LoadingComponent';
import ErrorView from '@components/ErrorView';

const LoginView = lazy(() => import('./UI/Routes/LoginView/index'));

const PostLoginRedirect = () => {
	const setUser = useUserStore(state => state.setUser);
	const { user, isLoading, isError, isFetching, errorMessage } = getMe();

	useLayoutEffect(() => {
		if (user) {
			setUser(user);
		}
	}, [user, setUser]);

	if (isLoading || isFetching) {
		return <LoadingComponent fullHeight label="Cargando sesión" />;
	}

	if (isError || !user) {
		return (
			<ErrorView
				title="No se pudo cargar el perfil del usuario."
				subTitle={
					errorMessage ??
					'Verifica que tu cuenta exista en Kobros y que Clerk use el mismo proyecto que la API.'
				}
			/>
		);
	}

	return <Navigate to={buildDefaultHomePath(user.typeUser)} replace />;
};

export const ProtectedLogin = () => {
	const { isLoaded, isSignedIn } = useAuth();

	if (!isLoaded) return <Spin fullscreen />;

	if (isSignedIn) {
		return <PostLoginRedirect />;
	}

	return (
		<Suspense fallback={<Spin fullscreen />}>
			<LoginView />
		</Suspense>
	);
};


interface ProtectedRouteProps {
	children: React.ReactNode;
}

const isBrandVerified = (): boolean => {
	try {
		return sessionStorage.getItem('brand_verified') === 'true';
	} catch {
		return false;
	}
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isLoaded, isSignedIn } = useAuth();
	const { user } = useUserStore();
	const [verified, setVerified] = useState(isBrandVerified);

	useEffect(() => {
		setVerified(isBrandVerified());
	}, [isSignedIn]);

	if (!isLoaded) return <Spin fullscreen />;

	if (!isSignedIn) {
		return <Navigate to={`/${routePaths.LOGIN}`} />;
	}

	const role = normalizeTypeUser(user?.typeUser);
	const isDev = role === TypeUser.dev;
	const isSuper = role === TypeUser.super;
	const hasBrand = Boolean(user?.brandId);

	if (!isDev && !isSuper && hasBrand && !verified) {
		return <BrandCodeVerification onVerified={() => setVerified(true)} />;
	}

	return <>{children}</>;
}

export default ProtectedRoute;
