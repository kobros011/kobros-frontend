import { Button, Flex, theme } from 'antd';
import { CSSProperties, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface MenuItemProps {
	label: ReactNode, 
	icon: ReactNode,
	mobile: boolean,
	isActive: boolean
	to: string
	/** Navega a la ruta (con confirmación si hay cambios sin guardar). */
	onNavigate: (path: string) => void
}

const MenuItem: FC<MenuItemProps> = ({ label, icon, mobile, isActive, to, onNavigate }) => {

	const { token } = theme.useToken();

	const style: CSSProperties = {
		height: 'auto',
		minHeight: 44,
		minWidth: 44,
		width: 'auto',
		flex: 1,
		paddingTop: 5,
		paddingInline: 10,
		border: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: isActive ? token.colorPrimaryBgHover : 'inherit',
	};
	return (
		<Flex justify="center" align="center" vertical style={mobile ? { flex: '0 1 auto', minWidth: 0 } : {}}>
			<Button
				type='text'
				style={mobile ? style : {}}
				onClick={() => onNavigate(`/${to}`)}
			>
				<Flex justify="center" align="center" vertical className='flex-menu-item' style={{ color: isActive ?  token.colorPrimary : 'inherit' }} >
					{icon}
					<Link to={to} onClick={event => event.preventDefault()} style={{ color: isActive ?  token.colorPrimary : 'inherit', ...(mobile ? { fontSize: 11, maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {}) }}>{label}</Link>
				</Flex>
			</Button>
		</Flex>
	);
};

export default MenuItem;