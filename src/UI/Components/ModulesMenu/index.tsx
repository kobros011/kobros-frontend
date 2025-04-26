import { Flex, Menu, theme } from 'antd';
import { FC, ReactNode } from 'react';
import MenuItem from './MenuItem';
import routePaths from '@/constants/routePaths';
import { TbRouteSquare } from 'react-icons/tb';
import { BsPersonCircle } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

type ItemTypeWithKey =  {
	label: ReactNode,
	icon: ReactNode,
	key: string;
	isShow: boolean;
};

export const ModulesMenu: FC<{ collapsed: boolean, mobile?: boolean }> = ({ collapsed, mobile = false }) => {

	const { token: { colorBgContainer } } = theme.useToken();

	const location = useLocation();
	const pattern = new RegExp(`${routePaths.DEFAULT_HOME}/([^/]+)`); // Expresión regular construida dinámicamente
	const locationKey = location.pathname.match(pattern)?.[1];

	const menuItems: ItemTypeWithKey[] = [
		{   
			label:<Link to={`${routePaths.DEFAULT_HOME}/${routePaths.INICIO}`}>Clientes</Link>,
			key:routePaths.INICIO,
			isShow: true,
			icon: <BsPersonCircle />,
		},
		{   
			label: <Link to={`${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}`}>Rutas</Link>,
			key: routePaths.ROUTES,
			isShow: true,
			icon: <TbRouteSquare />,
		},
	];

	if (!mobile) {
		return (
			<Menu
				mode='inline'
				items={menuItems}
				inlineCollapsed={collapsed}
				selectedKeys={[ locationKey ?? routePaths.INICIO ]}
			/>
		);
	}

	return (
		<Flex  gap={15} className={'menu'} style={{ background: colorBgContainer }}>
			{menuItems.map(({ isShow, key, ...item }) => (
				<MenuItem key={key} {...item} mobile={mobile}/>
			))}
		</Flex>
	);
};