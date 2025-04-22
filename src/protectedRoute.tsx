import { Navigate } from 'react-router-dom';
import useUserJWTStore from './infrastructure/context/User/UserDataJWTStore';
import routePaths from './constants/routePaths';
import LoginView from './UI/Routes/LoginView';
import { refreshToken as mutation } from './infrastructure/querys/Login';
import { useEffect } from 'react';

export const ProtectedLogin = () => {
	const { isExpiredAccessToken } = useUserJWTStore(state => state);

	const expiredAccessToken = isExpiredAccessToken();

	if (!expiredAccessToken) {
		return <Navigate to={`/${routePaths.DEFAULT_HOME}/${routePaths.INICIO}`} />;
	}

	return <LoginView />;
};


interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isExpiredAccessToken, isExpiredRefreshToken, jwt, setJwt } = useUserJWTStore(state => state);

	const refreshTokenMutation = mutation();

	const expiredAccessToken = isExpiredAccessToken();
	const expiredRefreshToken = isExpiredRefreshToken();

	useEffect(() => {
		const refreshToken = () => {
			refreshTokenMutation.mutate(jwt.refreshToken, {
				onSuccess: (response) => {
					setJwt(response.data);
				},
			});
		};

		if (expiredAccessToken && !expiredRefreshToken) {
			void refreshToken();
		}
	}, [expiredAccessToken, expiredRefreshToken, jwt.refreshToken]);


	if (expiredAccessToken && expiredRefreshToken) {
		return <Navigate to={`/${routePaths.LOGIN}`} />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;