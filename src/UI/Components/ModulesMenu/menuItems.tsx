import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';
import routePaths from '@/constants/routePaths';
import { TbRouteSquare, TbBrandAirtable } from 'react-icons/tb';
import { FaUsers } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { MdOutlineReceiptLong, MdOutlinePayments, MdOutlineAccountBalance, MdOutlineBarChart, MdOutlineRequestQuote } from 'react-icons/md';
import { DollarOutlined, SettingOutlined } from '@ant-design/icons';

export type ItemTypeWithKey = {
	label: ReactNode,
	icon: ReactNode,
	key: string;
	to: string;
	isShow: boolean;
};

export const OPERATION_SECTION_LABEL = 'OPERACIÓN';
export const ADMIN_SECTION_LABEL = 'ADMINISTRACIÓN';

// Operativos: lo que se usa día a día. Administrativos: configuración de la operación (menos frecuente).
// El orden de esta lista es el de los dos menús (lateral y barra inferior móvil, que muestra los 4 primeros y el resto en «Más»).
export const operationalItems: ItemTypeWithKey[] = [
	{
		label: 'Clientes',
		key: routePaths.CLIENTS,
		isShow: true,
		icon: <FaUsers style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.CLIENTS}`,
	},
	{
		label: 'Créditos',
		key: routePaths.LOANS,
		isShow: true,
		icon: <MdOutlineRequestQuote style={{ fontSize: 20, marginLeft: '-2px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.LOANS}`,
	},
	{
		label: 'Cobro del día',
		key: routePaths.COLLECTION_TODAY,
		isShow: true,
		icon: <MdOutlinePayments style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.COLLECTION_TODAY}`,
	},
	{
		label: 'Gastos',
		key: routePaths.EXPENSES,
		isShow: true,
		icon: <MdOutlineReceiptLong style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.EXPENSES}`,
	},
	{
		label: 'Liquidaciones',
		key: routePaths.LIQUIDATIONS,
		isShow: true,
		icon: <MdOutlineAccountBalance style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.LIQUIDATIONS}`,
	},
	{
		label: 'Cartera',
		key: routePaths.PAYMENTS,
		isShow: true,
		icon: <DollarOutlined style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.PAYMENTS}`,
	},
	{
		label: 'Reportes',
		key: routePaths.REPORTS,
		isShow: true,
		icon: <MdOutlineBarChart style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.REPORTS_DASHBOARD}`,
	},
];

export const adminItems: ItemTypeWithKey[] = [
	{
		label: 'Marcas',
		key: routePaths.BRANDS,
		isShow: true,
		icon: <TbBrandAirtable style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.BRANDS}`,
	},
	{
		label: 'Rutas',
		key: routePaths.ROUTES,
		isShow: true,
		icon: <TbRouteSquare style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}`,
	},
	{
		label: 'Usuarios',
		key: routePaths.USERS,
		isShow: true,
		icon: <BsPersonCircle style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.USERS}`,
	},
	{
		label: 'Configuración',
		key: routePaths.SETTINGS,
		isShow: true,
		icon: <SettingOutlined style={{ fontSize: 18, marginLeft: '-1px' }} />,
		to: `${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}`,
	},
];

/** Nombre visible del módulo (para breadcrumb y título móvil) a partir de la clave de la ruta. */
export const getModuleLabel = (key?: string): ReactNode | undefined => {
	if (key === routePaths.INICIO) return 'Inicio';
	return [...operationalItems, ...adminItems].find(item => item.key === key)?.label;
};

/** Icono del módulo (el mismo del menú) a un tamaño fijo y sin el ajuste de margen del menú, para usarlo en títulos. */
export const getModuleIcon = (key?: string, size = 16): ReactNode | undefined => {
	const icon = [...operationalItems, ...adminItems].find(item => item.key === key)?.icon;
	return isValidElement(icon) ? cloneElement(icon as ReactElement<{ style?: object }>, { style: { fontSize: size } }) : undefined;
};
