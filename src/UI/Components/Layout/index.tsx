import useUserJWTStore from '@/infrastructure/context/User/UserDataJWTStore';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getUser } from '@/infrastructure/querys/User';
import { useEffect, useState } from 'react';
import LoadingComponent from '../LoadingComponent';
import ErrorView from '@components/ErrorView';
import { Layout, App as Apps, Flex, theme, Image, Button } from 'antd';
import { Outlet } from 'react-router-dom';
import './layout.css';
import { ModulesMenu } from '../ModulesMenu';
import Icon from '@assets/icon.svg';
import Logo from '@assets/logo-transparent.png';
import { DropdownUser } from './DropdonwUser';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
	const { userId } = useUserJWTStore(state => state);
	const setUser = useUserStore(state => state.setUser);
	const darkMode = useUserModeStore(state => state.darkMode);
	const { token: { colorBgContainer, colorBorder } } = theme.useToken();

	const { user, isLoading, isError, isFetching } = getUser(userId);

	const matchMedia = '(min-width: 768px)';
	const [isMobile, setIsMobile] = useState(!window.matchMedia(matchMedia).matches);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		window.matchMedia(matchMedia).addEventListener('change', e => setIsMobile(!e.matches));
	}, []);

	useEffect(() => {
		if (!user) return;
		setUser(user);
	}, [user]);

	if (isLoading || isFetching) {
		return <LoadingComponent fullHeight label="Cargando Usuario" />;
	}

	if (isError) {
		return <ErrorView title="500 error al obtener el usuario" />;
	}

	return (
		<Apps>
			<Layout>
				<Header
					style={{
						width: isMobile ? '100vw' : collapsed ? '90vw' : '96vw',
						position: 'fixed',
						top: 0,
						right: 0,
						height: '60px',
						maxHeight: '60px',
						background: colorBgContainer,
						borderBottom: '2px solid' + colorBorder,
					}}
				>
					<Flex justify="space-between">
						{!isMobile &&
							<Button onClick={() => setCollapsed(!collapsed)}
								style={{
									position: 'relative',
									top: 12,
									left: '-30px',
								}}
							>
								{collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
							</Button>
						}
						{isMobile &&
							<Image src={Logo} preview={false} height={200} style={{ marginTop: '-70px', marginLeft: '-12vw' }} />
						}

						<DropdownUser />
					</Flex>
				</Header>

				{!isMobile && (
					<Sider
						style={{
							position: 'fixed',
							left: 0,
							top: 0,
							height: '100vh',
							maxWidth: collapsed ? '10vw' : '6vw',
							background: colorBgContainer,
							borderRight: '2px solid' + colorBorder,
						}}
						width={collapsed ? '10vw' : '4vw'}
					>
						{collapsed ? (
							<Image src={Logo} preview={false} height={200} style={{ marginTop: '-70px' }} />
						) : (
							<Image src={Icon} preview={false} width={'50%'} height={100} style={{ marginTop: '-20px', marginLeft: '1vw' }} />
						)}
						<div
							style={{ marginTop: !collapsed ? '-2.5vw' : '-15vh' }}
						>
							<ModulesMenu collapsed={!collapsed} />
						</div>
					</Sider>
				)}

				<Content
					style={{
						width: isMobile ? '100vw' : collapsed ? '90vw' : '96vw',
						height: '100vh',
						top: 60,
						right: 0,
						position: 'fixed',
						background: darkMode ? '#1a1a1a' : '#f5f5f5',
						padding: '1.5rem',
					}}
				>
					<Outlet/>

					{isMobile && (
						<ModulesMenu collapsed={false} mobile />
					)}
				</Content>
			</Layout>
		</Apps>
	);
};

export default App;