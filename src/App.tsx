import RouterApp from './RouterApp';
import esEs from 'antd/locale/es_ES';
import './App.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import { App, ConfigProvider, theme } from 'antd';
import useUserModeStore from './infrastructure/context/User/UserModeStore';
import useAppSettingsStore from './infrastructure/context/AppSettingsStore';

// Paleta "Kobros Financial Dark" (kobros_financial_dark/DESIGN.md). Todos los colores de la app salen de aquí.
const DARK_TOKENS = {
	colorBgBase: '#0f0f11',
	colorBgLayout: '#0f0f11',
	colorBgContainer: '#1a1a1e',
	colorBgElevated: '#222227',
	colorBorder: '#2d2d35',
	colorBorderSecondary: '#2d2d35',
	colorText: '#f4f4f5',
	colorTextSecondary: '#a1a1aa',
	colorTextTertiary: '#71717a',
	colorTextQuaternary: '#52525b',
};

const SEMANTIC_TOKENS = {
	colorSuccess: '#22c55e',
	colorError: '#ef4444',
	colorWarning: '#eab308',
	colorInfo: '#06b6d4',
};

const BRAND_LIME = '#84cc16';
const BODY_FONT = ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(', ');

function MyApp() {
	const { defaultAlgorithm, darkAlgorithm } = theme;
	const { darkMode } = useUserModeStore(state => state);
	const primaryColor = useAppSettingsStore(state => state.primaryColor);

	return (
		<ConfigProvider
			locale={esEs}
			theme={{
				token: {
					borderRadius: 8,
					paddingLG: 16,
					fontFamily: BODY_FONT,
					colorPrimary: primaryColor ?? BRAND_LIME,
					colorTextDisabled: darkMode ? '#71717a' : '#a1a1aa',
					...SEMANTIC_TOKENS,
					...(darkMode ? DARK_TOKENS : {}),
				},
				algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
			}}
		>
			<App>
				<RouterApp />
			</App>
		</ConfigProvider>
	);
}

export default MyApp;
