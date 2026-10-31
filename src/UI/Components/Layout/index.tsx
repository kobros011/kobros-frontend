import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getMe } from '@/infrastructure/querys/User';
import { useEffect, useState } from 'react';
import LoadingComponent from '../LoadingComponent';
import ErrorView from '@components/ErrorView';
import { Layout, App as Apps, Flex, theme, Image, Button } from 'antd';
import { Outlet } from 'react-router-dom';
import './layout.css';
import { ModulesMenu } from '../ModulesMenu';
import Icon from '@assets/icon.png';
import Logo from '@assets/logo-transparent.png';
import { DropdownUser } from './DropdonwUser';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import useBrandStore from '@/infrastructure/context/BrandsStore';
import { TypeUser } from '@/constants/types';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import useRouteStore from '@/infrastructure/context/RoutesStore';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
	const { getBrand } = useBrandStore(state => state);
	const { getRoutes } = useRouteStore(state => state);
	const setUser = useUserStore(state => state.setUser);
	const darkMode = useUserModeStore(state => state.darkMode);
	const { isMobile, setIsMobile } = useUserModeStore(state => state);
	const { token: { colorBgContainer, colorBorder } } = theme.useToken();

	const { user, isLoading, isError, isFetching } = getMe();

	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const handleChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		if (!user) return;
		setUser(user);
		void getRoutes();
		if (normalizeTypeUser(user.typeUser) !== TypeUser.dev) {
			void getBrand(user.brandId);
		}
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
						marginLeft: isMobile ? 0 : collapsed ? '190px' : '75px',
						width: 'auto',
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						height: '60px',
						maxHeight: '60px',
						background: colorBgContainer,
						borderBottom: '2px solid' + colorBorder,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Flex justify="space-between" align="center" style={{ width: '100%' }}>
						{!isMobile &&
							<Button onClick={() => setCollapsed(!collapsed)}>
								{collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
							</Button>
						}
						{isMobile &&
							<Image src={Logo} preview={false} width={120} />
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
							maxWidth: collapsed ? '190px' : '75px',
							background: colorBgContainer,
							borderRight: '2px solid' + colorBorder,
						}}
						width={collapsed ? '190px' : '75px'}
					>
						<Flex justify="center" align="center" style={{ height: '60px' }}>
							{collapsed ? (
								<Image src={Logo} preview={false} width={120} />
							) : (
								<Image src={Icon} preview={false} width={40} />
							)}
						</Flex>
						<div>
							<ModulesMenu collapsed={!collapsed} />
						</div>
					</Sider>
				)}

				<Content
					style={{
						marginLeft: isMobile ? 0 : collapsed ? '190px' : '75px',
						minHeight: 'calc(100vh - 60px)',
						marginTop: '60px',
						background: darkMode ? '#1a1a1a' : '#f5f5f5',
						padding: isMobile ? '10px' : '1.5rem',
						paddingBottom: isMobile ? 'calc(4rem + env(safe-area-inset-bottom, 0px) + 10px)' : '1.5rem',
						overscrollBehaviorY: 'contain',
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