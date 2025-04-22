import { UserOutlined } from '@ant-design/icons';
import { Flex, Menu, theme } from 'antd';
import { FC, ReactNode } from 'react';
import MenuItem from './MenuItem';

type ItemTypeWithKey =  {
	label: string,
	icon: ReactNode,
	key: string;
	isShow: boolean;
	path: string;
};

export const ModulesMenu: FC<{ collapsed: boolean, mobile?: boolean }> = ({ collapsed, mobile = false }) => {

	const { token: { colorBgContainer } } = theme.useToken();

	const menuItems: ItemTypeWithKey[] = [
		{   
			label:'Clientes',
			path:'',
			key: 'clients',
			isShow: true,
			icon: <UserOutlined />,
		},
		{   
			label:'Clientes',
			path:'',
			key: 'client1s',
			isShow: true,
			icon: <UserOutlined />,
		},
		{   
			label:'Clientes',
			path:'',
			key: 'clien2ts',
			isShow: true,
			icon: <UserOutlined />,
		},
	];

	if (!mobile) {
		return (
			<Menu
				items={menuItems}
				inlineCollapsed={collapsed}
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