import RouterApp from './RouterApp';
import esEs from 'antd/locale/es_ES';
import './App.css';
import { App, ConfigProvider, theme } from 'antd';
import useUserModeStore from './infrastructure/context/User/UserModeStore';

function MyApp() {
	const { defaultAlgorithm, darkAlgorithm, useToken } = theme;
	const { darkMode } = useUserModeStore(state => state);

	const token = useToken()?.token;

	return (
		<ConfigProvider
			locale={esEs}
			theme={{
				token: {
					borderRadius: 8,
					paddingLG: 16,
					colorPrimary: token['lime-6'],
					colorTextDisabled: darkMode ? '#d9d9d9' : '#434343',
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
