import { Card, CardProps } from 'antd';
import { FC } from 'react';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

/**
 * `Card` de las vistas de módulo. En móvil no hay Card anidado: va sin borde, con fondo
 * transparente, sin padding y sin altura máxima, para que el contenido fluya sobre el layout.
 * En escritorio es el `Card` de siempre.
 */
export const ResponsiveCard: FC<CardProps> = ({ style, styles, ...props }) => {
	const isMobile = useUserModeStore(state => state.isMobile);

	if (!isMobile) {
		return <Card style={style} styles={styles} {...props} />;
	}

	return (
		<Card
			{...props}
			variant="borderless"
			style={{ ...style, background: 'transparent', maxHeight: undefined }}
			styles={{ ...styles, body: { ...styles?.body, padding: 0 } }}
		/>
	);
};

export default ResponsiveCard;
