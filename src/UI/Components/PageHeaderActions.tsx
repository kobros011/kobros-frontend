import { Col, Flex, Row, Space, Typography } from 'antd';
import { cloneElement, FC, ReactElement, ReactNode } from 'react';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

type ButtonElement = ReactElement<{ block?: boolean }>;

interface PageHeaderActionsProps {
	/** Título de la página (solo en escritorio: en móvil ya lo muestra el header global). */
	title: ReactNode;
	/** Acción principal (ej. "Nuevo cliente"). */
	primary?: ButtonElement;
	/** Acciones secundarias, de izquierda a derecha en escritorio. */
	secondary?: ButtonElement[];
}

/**
 * Cabecera de página de los módulos.
 * Escritorio: título a la izquierda y botones a la derecha (secundarios y luego el principal).
 * Móvil: sin título; el botón principal a ancho completo y los secundarios en dos columnas.
 */
export const PageHeaderActions: FC<PageHeaderActionsProps> = ({ title, primary, secondary = [] }) => {
	const isMobile = useUserModeStore(state => state.isMobile);

	if (isMobile) {
		if (!primary && secondary.length === 0) return null;
		const span = secondary.length === 1 ? 24 : 12;

		return (
			<Flex vertical gap={8} style={{ marginBottom: 12 }}>
				{primary && cloneElement(primary, { block: true })}
				{secondary.length > 0 && (
					<Row gutter={[8, 8]}>
						{secondary.map((button, index) => (
							<Col key={button.key ?? index} span={span}>
								{cloneElement(button, { block: true })}
							</Col>
						))}
					</Row>
				)}
			</Flex>
		);
	}

	return (
		<div className='page-header '>
			<Row justify="space-between" align="middle">
				<Col>
					<Typography.Title level={2}>{title}</Typography.Title>
				</Col>
				<Col>
					<Space wrap>
						{secondary.map((button, index) => cloneElement(button, { key: button.key ?? index }))}
						{primary}
					</Space>
				</Col>
			</Row>
		</div>
	);
};

export default PageHeaderActions;
