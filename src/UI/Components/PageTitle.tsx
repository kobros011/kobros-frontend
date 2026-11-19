import { FC, ReactNode } from 'react';
import { Flex, Typography } from 'antd';

interface PageTitleProps {
	icon: ReactNode
	title: string
	/** Nivel del título: 4 dentro de una tarjeta, 5 en la barra superior del layout. */
	level?: 4 | 5
}

/** Título de página: icono en caja verde tenue + texto. Se usa en el encabezado de la tarjeta (escritorio) o en la barra del layout (móvil). */
export const PageTitle: FC<PageTitleProps> = ({ icon, title, level = 4 }) => (
	<Flex align="center" gap={level === 5 ? 8 : 12} style={{ minWidth: 0, whiteSpace: 'normal' }}>
		<Flex
			align="center"
			justify="center"
			style={{
				flex: 'none',
				width: level === 5 ? 32 : 40,
				height: level === 5 ? 32 : 40,
				borderRadius: level === 5 ? 8 : 10,
				background: 'rgba(132, 204, 22, 0.12)',
				color: '#84cc16',
				fontSize: level === 5 ? 16 : 18,
			}}
		>
			{icon}
		</Flex>
		<Typography.Title level={level} style={{ margin: 0, minWidth: 0 }}>{title}</Typography.Title>
	</Flex>
);

export default PageTitle;
