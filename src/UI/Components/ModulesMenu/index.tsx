import { Button, Drawer, Flex, Menu, theme } from 'antd';
import { FC, ReactNode, useState } from 'react';
import MenuItem from './MenuItem';
import routePaths from '@/constants/routePaths';
import { TbRouteSquare, TbBrandAirtable } from 'react-icons/tb';
import { FaUsers } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getPermission } from '@/infrastructure/utils/Permissions';
import { MdOutlineReceiptLong, MdOutlinePayments, MdOutlineAccountBalance, MdOutlineBarChart } from 'react-icons/md';
import { DollarOutlined, MoreOutlined, SettingOutlined } from '@ant-design/icons';
import { MdOutlineRequestQuote } from 'react-icons/md';

const MOBILE_PRIMARY_COUNT = 4;

type ItemTypeWithKey =  {
	label: ReactNode,
	icon: ReactNode,
	key: string;
	to: string;
	isShow: boolean;
};

export const ModulesMenu: FC<{ collapsed: boolean, mobile?: boolean }> = ({ collapsed, mobile = false }) => {

	const { token: { colorBgContainer, colorPrimary, colorPrimaryBgHover } } = theme.useToken();
	const { typeUser } = useUserStore(state => state.user);
	const { hasShowViewsKeys } = getPermission(typeUser);
	const [moreOpen, setMoreOpen] = useState(false);

	const location = useLocation();
	const pattern = new RegExp(`${routePaths.DEFAULT_HOME}/([^/]+)`); // Expresión regular construida dinámicamente
	const locationKey = location.pathname.match(pattern)?.[1];

	// Operativos: lo que se usa día a día. Administrativos: configuración de la operación (menos frecuente).
	const operationalItems: ItemTypeWithKey[] = [
		{
			label: 'Clientes',
			key:routePaths.CLIENTS,
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
			label: 'Cartera',
			key: routePaths.PAYMENTS,
			isShow: true,
			icon: <DollarOutlined style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to:`${routePaths.DEFAULT_HOME}/${routePaths.PAYMENTS}`,
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
			label: 'Reportes',
			key: routePaths.REPORTS,
			isShow: true,
			icon: <MdOutlineBarChart style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to: `${routePaths.DEFAULT_HOME}/${routePaths.REPORTS_DASHBOARD}`,
		},
	];

	const adminItems: ItemTypeWithKey[] = [
		{
			label: 'Marcas',
			key: routePaths.BRANDS,
			isShow: true,
			icon: <TbBrandAirtable style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to:`${routePaths.DEFAULT_HOME}/${routePaths.BRANDS}`,
		},
		{
			label: 'Rutas',
			key: routePaths.ROUTES,
			isShow: true,
			icon: <TbRouteSquare style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to:`${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}`,
		},
		{
			label: 'Usuarios',
			key: routePaths.USERS,
			isShow: true,
			icon: <BsPersonCircle style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to:`${routePaths.DEFAULT_HOME}/${routePaths.USERS}`,
		},
		{
			label: 'Configuración',
			key: routePaths.SETTINGS,
			isShow: true,
			icon: <SettingOutlined style={{ fontSize: 18, marginLeft: '-1px' }} />,
			to: `${routePaths.DEFAULT_HOME}/${routePaths.SETTINGS}`,
		},
	];

	const operationalFiltered = operationalItems.filter(item => hasShowViewsKeys.includes(item.key));
	const adminFiltered = adminItems.filter(item => hasShowViewsKeys.includes(item.key));
	const menuItemsFiltered = [...operationalFiltered, ...adminFiltered];

	if (!mobile) {
		const toMenuItem = ({ label, to, ...item }: ItemTypeWithKey) => ({ label: <Link to={to}>{label}</Link>, ...item });
		const items = [
			...operationalFiltered.map(toMenuItem),
			...(adminFiltered.length > 0 ? [{ type: 'divider' as const, key: 'admin-divider' }] : []),
			...adminFiltered.map(toMenuItem),
		];

		return (
			<Menu
				mode='inline'
				items={items}
				inlineCollapsed={collapsed}
				selectedKeys={[ locationKey ?? routePaths.INICIO ]}
			/>
		);
	}

	const primaryItems = menuItemsFiltered.slice(0, MOBILE_PRIMARY_COUNT);
	const overflowItems = menuItemsFiltered.slice(MOBILE_PRIMARY_COUNT);
	const hasOverflow = overflowItems.length > 0;
	const moreIsActive = overflowItems.some(item => locationKey === item.key);

	return (
		<>
			<Flex className={'menu'} style={{ background: colorBgContainer }}>
				{primaryItems.map(({ isShow, key, ...item }) => (
					<MenuItem isActive={locationKey == key} key={key} {...item} mobile={mobile}/>
				))}
				{hasOverflow && (
					<Flex justify="center" align="center" vertical style={{ flex: 1 }}>
						<Button
							type="text"
							onClick={() => setMoreOpen(true)}
							style={{
								height: 'auto',
								minHeight: 44,
								minWidth: 44,
								flex: 1,
								paddingTop: 5,
								border: 'none',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: moreIsActive ? colorPrimaryBgHover : 'inherit',
							}}
						>
							<Flex
								justify="center"
								align="center"
								vertical
								className="flex-menu-item"
								style={{ color: moreIsActive ? colorPrimary : 'inherit' }}
							>
								<MoreOutlined style={{ fontSize: 18 }} />
								<span style={{ color: moreIsActive ? colorPrimary : 'inherit', fontSize: 12 }}>Más</span>
							</Flex>
						</Button>
					</Flex>
				)}
			</Flex>

			<Drawer
				title="Más opciones"
				placement="bottom"
				height="auto"
				open={moreOpen}
				onClose={() => setMoreOpen(false)}
				styles={{ body: { padding: 0, background: colorBgContainer } }}
			>
				{overflowItems.map(({ label, icon, to, key }) => (
					<Link
						key={key}
						to={`/${to}`}
						onClick={() => setMoreOpen(false)}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							padding: '12px 16px',
							minHeight: 44,
							color: 'inherit',
							background: locationKey === key ? colorPrimaryBgHover : undefined,
						}}
					>
						{icon}
						<span>{label}</span>
					</Link>
				))}
			</Drawer>
		</>
	);
};
