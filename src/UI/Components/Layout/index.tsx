import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getMe } from '@/infrastructure/querys/User';
import { useEffect, useState } from 'react';
import LoadingComponent from '../LoadingComponent';
import ErrorView from '@components/ErrorView';
import PageTitle from '@/UI/Components/PageTitle';
import { Layout, App as Apps, Flex, theme, Button, Breadcrumb, Typography } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import './layout.css';
import { ModulesMenu } from '../ModulesMenu';
import { getModuleIcon, getModuleLabel } from '../ModulesMenu/menuItems';
import usePageTitleStore from '@/infrastructure/context/PageTitleStore';
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
import routePaths from '@/constants/routePaths';

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
	const { isMobile, setIsMobile } = useUserModeStore(state => state);
	const { token: { colorBgContainer, colorBgLayout, colorBorder } } = theme.useToken();
	const location = useLocation();

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

	// El logo solo se muestra si la marca lo configuró; si no, no se pinta ningún logo por defecto.
	const hasBrandLogo = !!(brandLogo.logoFullUrl || brandLogo.logoMarkUrl);
	const moduleKey = location.pathname.match(new RegExp(`${routePaths.DEFAULT_HOME}/([^/]+)`))?.[1];
	const moduleLabel = getModuleLabel(moduleKey);
	const pageLabel = location.pathname.endsWith('/campos/obligatorios')
		? 'Campos obligatorios'
		: location.pathname.endsWith('/campos/personalizados') ? 'Campos personalizados' : undefined;
	const moduleIcon = getModuleIcon(moduleKey);
	// Una pantalla (ver/editar/crear) puede poner su propio título en la barra móvil; si no, va el nombre del módulo.
	const pageTitle = usePageTitleStore(state => state.title);
	const headerTitle = pageTitle ?? moduleLabel;

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
						// Ant Design deja 50 px a cada lado: en móvil el contenido va pegado a 12 px.
						paddingInline: isMobile ? 12 : undefined,
						zIndex: FIXED_CHROME_Z_INDEX,
						background: colorBgContainer,
						borderBottom: '2px solid' + colorBorder,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Flex justify="space-between" align="center" style={{ width: '100%', minWidth: 0 }}>
						<Flex align="center" gap={12} style={{ minWidth: 0 }}>
							{isMobile && hasBrandLogo &&
								<BrandLogo key={`${brandLogo.logoFullUrl ?? 'default'}`} variant="full" height={36} {...brandLogo} />
							}
							{/* Móvil: el título del módulo (icono + nombre) vive aquí, pegado a la izquierda; las pantallas no lo repiten. */}
							{isMobile && !hasBrandLogo && headerTitle && (moduleIcon && typeof headerTitle === 'string'
								? <PageTitle icon={moduleIcon} title={headerTitle} level={5} />
								: <Typography.Title level={5} style={{ margin: 0 }}>{headerTitle}</Typography.Title>)
							}
							{!isMobile &&
								<Breadcrumb items={[{ title: 'Inicio' }, ...(moduleLabel ? [{ title: moduleLabel }] : []), ...(pageLabel ? [{ title: pageLabel }] : [])]} />
							}
						</Flex>

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
						<Flex justify={hasBrandLogo ? 'space-between' : 'flex-end'} align="center" style={{ height: '60px', padding: '0 12px' }}>
							{hasBrandLogo && (collapsed ? (
								<BrandLogo key={`${brandLogo.logoFullUrl ?? 'default'}`} variant="full" height={36} {...brandLogo} />
							) : (
								<BrandLogo key={`${brandLogo.logoMarkUrl ?? 'default'}-${brandLogo.logoFullUrl ?? 'default'}`} variant="mark" height={40} {...brandLogo} />
							))}
							<Button
								type="text"
								onClick={() => setCollapsed(!collapsed)}
								aria-label={collapsed ? 'Contraer menú' : 'Expandir menú'}
							>
								{collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
							</Button>
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
						background: colorBgLayout,
						// El contenido empieza desde arriba (por debajo del header fijo, de 60px) para que no quede hueco
						// del fondo del layout entre el header y el cuerpo; el espacio del header va como padding superior.
						padding: isMobile ? 'calc(60px + 10px) 10px 10px' : 'calc(60px + 1.5rem) 1.5rem 1.5rem',
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
