import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getMe } from '@/infrastructure/querys/User';
import { useEffect, useState } from 'react';
import LoadingComponent from '../LoadingComponent';
import ErrorView from '@components/ErrorView';
import { Layout, App as Apps, Flex, theme, Button } from 'antd';
import { Outlet } from 'react-router-dom';
import './layout.css';
import { ModulesMenu } from '../ModulesMenu';
import BrandLogo from '../BrandLogo';
import { DropdownUser } from './DropdonwUser';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import useBrandStore from '@/infrastructure/context/BrandsStore';
import { TypeUser } from '@/constants/types';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { useCurrencyBootstrap } from '@/infrastructure/querys/Currency';
import { getSettings } from '@/infrastructure/querys/Settings';
import { DEFAULT_APP_NAME } from '@/domain/Settings';

const { Header, Sider, Content } = Layout;

// Todo elemento con `position: fixed` necesita un `zIndex` explícito. Sin uno, el navegador
// no garantiza que quede por encima del contenido normal: al hacer scroll, el Content (que
// no está posicionado) puede pintarse encima del Header/Sider "fijos" y taparlos o mezclarse
// con ellos. El menú inferior móvil (`.menu` en layout.css) ya hace esto bien con z-index: 1000;
// Header y Sider deben quedar por debajo de eso pero por encima del Content.
const FIXED_CHROME_Z_INDEX = 10;

const App: React.FC = () => {
	const { getBrand } = useBrandStore(state => state);
	const { getRoutes } = useRouteStore(state => state);
	const setUser = useUserStore(state => state.setUser);
	const darkMode = useUserModeStore(state => state.darkMode);
	const { isMobile, setIsMobile } = useUserModeStore(state => state);
	const { token: { colorBgContainer, colorBorder } } = theme.useToken();

	const { user, isLoading, isError, isFetching } = getMe();
	const { settings, isError: isSettingsError } = getSettings(undefined, !!user);
	useCurrencyBootstrap(!!user);
	const currencyVersion = useCurrencyStore(state => state.version);
	const brandCurrencies = useAppSettingsStore(state => state.currencies.join(','));
	const applySettings = useAppSettingsStore(state => state.apply);
	const markSettingsLoaded = useAppSettingsStore(state => state.markLoaded);
	const brandLogo = useAppSettingsStore(state => ({
		logoFullUrl: state.logoFullUrl,
		logoFullWidth: state.logoFullWidth,
		logoFullHeight: state.logoFullHeight,
		logoFullTone: state.logoFullTone,
		logoMarkUrl: state.logoMarkUrl,
		logoMarkWidth: state.logoMarkWidth,
		logoMarkHeight: state.logoMarkHeight,
		logoMarkTone: state.logoMarkTone,
		appName: state.appName,
		loaded: state.loaded,
	}));

	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const handleChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		if (settings) applySettings(settings);
		else if (isSettingsError) markSettingsLoaded();
	}, [settings, isSettingsError]);

	useEffect(() => {
		document.title = brandLogo.appName || DEFAULT_APP_NAME;
	}, [brandLogo.appName]);

	useEffect(() => {
		const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (!favicon) return;
		const defaultHref = favicon.getAttribute('data-default-href') ?? favicon.href;
		favicon.setAttribute('data-default-href', defaultHref);
		// El favicon es pequeño y cuadrado: prioriza el logo de "mark" (ícono) sobre el horizontal.
		favicon.href = brandLogo.logoMarkUrl ?? brandLogo.logoFullUrl ?? defaultHref;
	}, [brandLogo.logoMarkUrl, brandLogo.logoFullUrl]);

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
						zIndex: FIXED_CHROME_Z_INDEX,
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
							<BrandLogo key={`${brandLogo.logoFullUrl ?? 'default'}`} variant="full" height={36} {...brandLogo} />
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
							zIndex: FIXED_CHROME_Z_INDEX,
							background: colorBgContainer,
							borderRight: '2px solid' + colorBorder,
						}}
						width={collapsed ? '190px' : '75px'}
					>
						<Flex justify="center" align="center" style={{ height: '60px' }}>
							{collapsed ? (
								<BrandLogo key={`${brandLogo.logoFullUrl ?? 'default'}`} variant="full" height={36} {...brandLogo} />
							) : (
								<BrandLogo key={`${brandLogo.logoMarkUrl ?? 'default'}-${brandLogo.logoFullUrl ?? 'default'}`} variant="mark" height={40} {...brandLogo} />
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
					<Outlet key={`${currencyVersion}-${brandCurrencies}`}/>

					{isMobile && (
						<ModulesMenu collapsed={false} mobile />
					)}
				</Content>
			</Layout>
		</Apps>
	);
};

export default App;