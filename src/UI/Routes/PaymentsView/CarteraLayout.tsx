import { FC, ReactNode } from 'react';
import { Col, Row, Tabs, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';

interface CarteraLayoutProps {
	children: ReactNode;
}

/** Encabezado compartido entre Cartera activa y Cartera en mora, con pestañas para cambiar de una a otra. */
export const CarteraLayout: FC<CarteraLayoutProps> = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const activeKey = location.pathname.endsWith('/mora') ? 'mora' : 'activa';

	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Cartera</Typography.Title>
					</Col>
				</Row>
			</div>

			<Tabs
				activeKey={activeKey}
				onChange={(key) => void navigate(`/${routePaths.DEFAULT_HOME}/${key === 'mora' ? routePaths.PAYMENTS_DELINQUENCY : routePaths.PAYMENTS}`)}
				items={[
					{ key: 'activa', label: 'Cartera activa' },
					{ key: 'mora', label: 'Cartera en mora' },
				]}
			/>

			{children}
		</>
	);
};

export default CarteraLayout;
