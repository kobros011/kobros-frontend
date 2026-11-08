import NotFoundView from '@routes/NotFoundView/index';
import { BrowserRouter, Navigate, Route, RouteProps, Routes } from 'react-router-dom';
import routePaths from './constants/routePaths';
import { RequestInterceptor } from './Interceptors';
import { lazy, Suspense } from 'react';
import LayoutView from '@components/Layout';
import LoadingComponent from './UI/Components/LoadingComponent';
import ProtectedRoute, { ProtectedLogin } from './protectedRoute';
import { getPermission } from './infrastructure/utils/Permissions';
import useUserStore from './infrastructure/context/User/UserDataStore';

const HomeView = lazy(() => import('@routes/HomeView/index'));
// Rutas
const RoutesView = lazy(() => import('@routes/RoutesView/index'));
const FormRouteView = lazy(() => import('@routes/RoutesView/Form'));
const RouteDetailView = lazy(() => import('@routes/RoutesView/RouteDetail'));

// Marcas
const BrandsView = lazy(() => import('@routes/BrandsView/index'));
const FormBrandView = lazy(() => import('@routes/BrandsView/Form'));

// Usuarios
const UsersView = lazy(() => import('@routes/UsersView/index'));
const FormUsersView = lazy(() => import('@routes/UsersView/Form'));

// Clientes
const ClientsView = lazy(() => import('@routes/ClientsView/index'));
const FormClientsView = lazy(() => import('@routes/ClientsView/Form'));

// Creditos
const FormLoanView = lazy(() => import('@routes/LoansView/Form'));
const DetailsLoanView = lazy(() => import('@routes/LoansView/DetailsLoan'));
const LoansView = lazy(() => import('@routes/LoansView/layout'));

// Cartera
const PaymentsView = lazy(() => import('@routes/PaymentsView/index'));
const PaymentsDelinquencyView = lazy(() => import('@routes/PaymentsView/Delinquency'));

// Gastos
const ExpensesView = lazy(() => import('@routes/ExpensesView/index'));
const FormExpensesView = lazy(() => import('@routes/ExpensesView/Form'));

// Cobro del día
const CollectionTodayView = lazy(() => import('./UI/Routes/CollectionTodayView/index'));

// Liquidaciones
const LiquidationsView = lazy(() => import('./UI/Routes/LiquidationsView/index'));

// Reportes
const ReportsDashboardView = lazy(() => import('./UI/Routes/ReportsView/Dashboard'));
const ReportsWeeklyView = lazy(() => import('./UI/Routes/ReportsView/WeeklyReport'));
const ReportsAnnualView = lazy(() => import('./UI/Routes/ReportsView/AnnualReport'));

// Configuración
const SettingsView = lazy(() => import('@routes/SettingsView/index'));

const HomeRoutes = () => {
	const { typeUser } = useUserStore(state => state.user);
	const { hasShowViewsKeys } = getPermission(typeUser);

	const routes: RouteProps[] = [
		{
			path: routePaths.INICIO,
			children: <Route element={<HomeView />} index />,
		},
		{
			path: routePaths.ROUTES,
			children:  (
				<>
					<Route element={<RoutesView />} index />,
					<Route path={routePaths.DEFAULT_CREATE} element={<FormRouteView />} />
					<Route path={routePaths.ROUTES_CASH} element={<RouteDetailView />} />
					<Route path={routePaths.DEFAULT_EDIT} element={<RouteDetailView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<RouteDetailView readonly />} />
				</>
			),
		},
		{
			path: routePaths.BRANDS,
			children: (
				<>
					<Route element={<BrandsView />} index />,
					<Route path={routePaths.DEFAULT_CREATE} element={<FormBrandView />} />
					<Route path={routePaths.DEFAULT_EDIT} element={<FormBrandView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<FormBrandView readonly />} />
				</>
			),
		},
		{
			path: routePaths.USERS,
			children: (
				<>
					<Route element={<UsersView />} index />,
					<Route path={routePaths.DEFAULT_CREATE} element={<FormUsersView />} />
					<Route path={routePaths.DEFAULT_EDIT} element={<FormUsersView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<FormUsersView readonly />} />
				</>
			),
		},
		{
			path: routePaths.CLIENTS,
			children: (
				<>
					<Route element={<ClientsView />} index />,
					<Route path={routePaths.DEFAULT_CREATE} element={<FormClientsView />} />
					<Route path={routePaths.DEFAULT_EDIT} element={<FormClientsView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<FormClientsView readonly />} />
				</>
			),
		},
		{
			path: routePaths.LOANS,
			children: (
				<>
					<Route element={<LoansView />} index />
					<Route path={routePaths.DEFAULT_CREATE} element={<FormLoanView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<DetailsLoanView />} />
				</>
			),
		},
		{
			path: routePaths.PAYMENTS,
			children: (
				<>
					<Route index element={<PaymentsView />} />
					<Route path='mora' element={<PaymentsDelinquencyView />} />
				</>
			),
		},
		{
			path: routePaths.EXPENSES,
			children: (
				<>
					<Route element={<ExpensesView />} index />
					<Route path={routePaths.DEFAULT_CREATE} element={<FormExpensesView />} />
					<Route path={routePaths.DEFAULT_EDIT} element={<FormExpensesView />} />
					<Route path={routePaths.DEFAULT_SEE} element={<FormExpensesView readonly />} />
				</>
			),
		},
		{
			path: routePaths.COLLECTION_TODAY,
			children: (
				<Route index element={<CollectionTodayView />} />
			),
		},
		{
			path: routePaths.LIQUIDATIONS,
			children: (
				<Route index element={<LiquidationsView />} />
			),
		},
		{
			path: routePaths.REPORTS,
			children: (
				<>
					<Route index element={<Navigate to="resumen" replace />} />
					<Route path='resumen' element={<ReportsDashboardView />} />
					<Route path='semanal' element={<ReportsWeeklyView />} />
					<Route path='anual' element={<ReportsAnnualView />} />
				</>
			),
		},
		{
			path: routePaths.SETTINGS,
			children: (
				<Route index element={<SettingsView />} />
			),
		},
	];

	const routesFiltered = routes?.filter(item =>
		item.path === routePaths.INICIO || hasShowViewsKeys.includes(item.path ?? ''),
	);

	return (
		<Suspense fallback={<LoadingComponent />}>
			<Routes>
				{routesFiltered.map((route, index) => (
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