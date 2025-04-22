import { Button, Dropdown, Flex, Select, Typography } from 'antd';
import UserInitialsLogo from './UserInitialsLogo';
import { DownOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { getNameTypeUser } from '@/infrastructure/utils/getTypeUserText';
import { Option, TypeUser } from '@/constants/types';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { MenuProps } from 'antd/lib';
import useUserModeStore, { UserFontUse } from '@/infrastructure/context/User/UserModeStore';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import useUserJWTStore from '@/infrastructure/context/User/UserDataJWTStore';

export const DropdownUser: FC = () => {
	const { user: userStore, resetStore: resetUserStore } = useUserStore(state => state);
	const resetJwt = useUserJWTStore(state => state.resetStore);
	const { darkMode, userMode, setUserMode, setMode, resetStore } = useUserModeStore(state => state);

	const navigate = useNavigate();

	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		const isDark = event.matches;
		if (userMode == UserFontUse.AUTO)setMode(isDark);
	});

	const options: Option[] = [
		{ label: 'Automatico', value: UserFontUse.AUTO },
		{ label: 'Claro', value: UserFontUse.LIGHT },
		{ label: 'Oscuro', value: UserFontUse.DARK },
	];

	const onSelectFontMode = (value: UserFontUse) => {
		setUserMode(value);
		if (value == UserFontUse.AUTO) {
			setMode(prefersDarkMode);
			return;
		}

		if (value == UserFontUse.LIGHT) {
			setMode(false);
			return;
		}

		setMode(true);
	};

	useEffect(() => {
		if (userMode == UserFontUse.AUTO && prefersDarkMode) {
			setMode(prefersDarkMode);
		}
	}, []);

	const onHandleLogout = () => {
		void resetStore();
		void resetJwt();
		void resetUserStore();
		void navigate(`/${routePaths.LOGIN}`);
	};

	const itemsMenu: MenuProps['items'] = [
		{
			key: 'mondeFont',
			label:  (
				<Flex justify='space-between' align='center' gap={8} style={{ width: '100%' }}>
					<Flex justify='start' gap={6}>
						{darkMode ? <MoonOutlined style={{ fontSize: '16px' }} /> : <SunOutlined style={{ fontSize: '16px' }} />}
						<Typography.Text>Tema</Typography.Text>
					</Flex>

					<Select
						onSelect={(value) => onSelectFontMode(value)}
						style={{ width: 120 }}
						defaultValue={userMode}
						popupMatchSelectWidth={false}
						options={options}
					/>
				</Flex>
			),
			popupStyle:{ display: 'none' },
			children:[],
			expandIcon: <></>,
		},
		{
			key: 'logout',
			icon: <LogoutOutlined style={{ fontSize: '16px' }} />,
			label: 'Cerrar Sesión',
			onClick: () => onHandleLogout(),
		},
	];

	return (
		<Dropdown
			trigger={['click']}
			menu={{ items: itemsMenu }}
		>
			<Button style={{
				height: '2.5rem',
				marginTop: '10px',
				position: 'absolute',
				right: 8,
			}}>
				<Flex gap={10}>
					<UserInitialsLogo name={userStore?.name} lastName={userStore?.lastName} />
					<Flex vertical align="start">
						<Typography.Title style={{ margin: 0, padding: 0 }} level={5}>{`${userStore.name?.split(' ')[0]} ${userStore.lastName?.split(' ')[0]}`}</Typography.Title>
						<Typography.Text style={{ margin: 0, padding: 0, marginTop: '-5px' }} >{getNameTypeUser(userStore.typeUser as TypeUser)}</Typography.Text>
					</Flex>
					<DownOutlined />
				</Flex>
			</Button>
		</Dropdown>
	);
};