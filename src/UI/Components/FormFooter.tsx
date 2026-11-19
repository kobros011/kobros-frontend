import { Flex, theme } from 'antd';
import { FC, ReactNode } from 'react';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

/**
 * Pie fijo de los formularios (Cancelar + acción principal): queda pegado al borde inferior de la tarjeta (escritorio) o de
 * la pantalla, por encima del menú inferior (móvil), así los botones siempre están a la vista. En móvil van en una sola fila
 * y centrados para ocupar poco alto. Ponerlo como último hijo de la tarjeta o del formulario (ver `.kb-form-footer` en App.css).
 */
const FormFooter: FC<{ children: ReactNode }> = ({ children }) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const { token } = theme.useToken();

	return (
		<div
			className="kb-form-footer"
			style={{ background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}` }}
		>
			<Flex gap={8} wrap="nowrap" align="center" justify={isMobile ? 'center' : 'flex-end'}>
				{children}
			</Flex>
		</div>
	);
};

export default FormFooter;
