import { FC } from 'react';
import { theme, Tooltip, TooltipProps } from 'antd';

/** Tooltip con el color principal de la marca (el que se configura en Configuración; verde Kobros si no hay). */
export const PrimaryTooltip: FC<TooltipProps> = props => {
	const { token } = theme.useToken();
	return <Tooltip color={token.colorPrimary} {...props} />;
};
