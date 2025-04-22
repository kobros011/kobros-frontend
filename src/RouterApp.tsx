import NotFoundView from '@routes/NotFoundView/index';
import { BrowserRouter, Navigate, Route, RouteProps, Routes } from 'react-router-dom';
import routePaths from './constants/routePaths';
import { RequestInterceptor } from './Interceptors';
import { lazy, Suspense } from 'react';
import LayoutView from '@components/Layout';
import LoadingComponent from './UI/Components/LoadingComponent';
import ProtectedRoute, { ProtectedLogin } from './protectedRoute';

const HomeView = lazy(() => import('@routes/HomeView/index'));

const HomeRoutes = () => {
	const routes: RouteProps[] = [
		{
			path: routePaths.INICIO,
			children: <Route element={<HomeView />} index />,
		},
	];

	return (
		<Suspense fallback={<LoadingComponent />}>
			<Routes>
				{routes.map((route, index) => (
					<Route key={index} {...route} />
				))}
				<Route path='*' element={<NotFoundView />} />
			</Routes>
		</Suspense>
	);
};

export default function RouterApp() {
	return (
		<BrowserRouter basename={routePaths.BASENAME}>
			<RequestInterceptor />
            
			<Routes>
				<Route path='/' element={<Navigate to={routePaths.LOGIN} replace />} index />
				<Route path={routePaths.LOGIN} element={<ProtectedLogin />} index />
				<Route element={<ProtectedRoute> <LayoutView /> </ProtectedRoute>}>
					<Route path={`${routePaths.DEFAULT_HOME}/*`} element={<HomeRoutes />} />
				</Route>
				<Route path='*' element={<NotFoundView />} index />
			</Routes>
		</BrowserRouter>
	);
}