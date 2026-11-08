import routePaths from '@/constants/routePaths';
import { TypeUser } from '@/constants/types';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';

export const getPermission = (typeUser: TypeUser | string) => {
	const role = normalizeTypeUser(typeUser) ?? TypeUser.collector;
	const hasViewBrands = role === TypeUser.dev;
	const hasViewRoutes = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.partner].includes(role);
	const hasViewUsers = [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);
	const hasViewClients = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.collector].includes(role);
	const hasViewLoans = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.collector].includes(role);
	const hasViewPayments = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.partner].includes(role);
	const hasViewExpenses = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.collector].includes(role);
	const hasViewCollectionToday = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.partner, TypeUser.collector].includes(role);
	const hasViewLiquidations = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.collector].includes(role);
	const hasViewReports = [TypeUser.dev, TypeUser.super, TypeUser.admin, TypeUser.partner].includes(role);
	const hasRouteCashAccess = [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);
	const hasManageSettings = [TypeUser.dev, TypeUser.super].includes(role);
	const hasManageExpenses = [TypeUser.dev, TypeUser.super, TypeUser.admin].includes(role);

	const hasShowViewsKeys = [];

	if (hasViewBrands) hasShowViewsKeys.push(routePaths.BRANDS);
	if (hasViewRoutes) hasShowViewsKeys.push(routePaths.ROUTES);
	if (hasViewUsers) hasShowViewsKeys.push(routePaths.USERS);
	if (hasViewClients) hasShowViewsKeys.push(routePaths.CLIENTS);
	if (hasViewLoans) hasShowViewsKeys.push(routePaths.LOANS);
	if (hasViewPayments) hasShowViewsKeys.push(routePaths.PAYMENTS);
	if (hasViewExpenses) hasShowViewsKeys.push(routePaths.EXPENSES);
	if (hasViewCollectionToday) hasShowViewsKeys.push(routePaths.COLLECTION_TODAY);
	if (hasViewLiquidations) hasShowViewsKeys.push(routePaths.LIQUIDATIONS);
	if (hasViewReports) hasShowViewsKeys.push(routePaths.REPORTS);
	if (hasManageSettings) hasShowViewsKeys.push(routePaths.SETTINGS);

	return {
		hasViewBrands,
		hasViewRoutes,
		hasViewUsers,
		hasViewClients,
		hasShowViewsKeys,
		hasViewLoans,
		hasViewReports,
		hasRouteCashAccess,
		hasManageExpenses,
		hasManageSettings,
	};
};
