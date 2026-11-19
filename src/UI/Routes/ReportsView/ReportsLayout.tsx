import PageHeaderActions from '@/UI/Components/PageHeaderActions';
import { FC, ReactNode } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';


const TABS = [
	{ key: 'resumen', label: 'Resumen' },
	{ key: 'semanal', label: 'Semanal' },
	{ key: 'anual', label: 'Anual' },
];

/** Encabezado de Reportes con pestañas Resumen · Semanal · Anual (la pestaña activa sale de la URL). */
export const ReportsLayout: FC<{ children: ReactNode }> = ({ children }) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const activeKey = TABS.find(tab => pathname.endsWith(`/${tab.key}`))?.key ?? 'resumen';

	return (
		<>
			<PageHeaderActions title="Reportes" />

			<Tabs
				activeKey={activeKey}
				items={TABS}
				onChange={key => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.REPORTS}/${key}`)}
			/>

			{children}
		</>
	);
};

export default ReportsLayout;
