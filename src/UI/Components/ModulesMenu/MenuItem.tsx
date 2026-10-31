import { Button, Flex, theme } from 'antd';
import { CSSProperties, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface MenuItemProps {
	label: ReactNode, 
	icon: ReactNode,
	mobile: boolean,
	isActive: boolean
	to: string
}

const MenuItem: FC<MenuItemProps> = ({ label, icon, mobile, isActive, to }) => {

	const { token } = theme.useToken();

	const style: CSSProperties = {
		height: 'auto',
		minHeight: 44,
		minWidth: 44,
		flex: 1,
		paddingTop: 5,
		border: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: isActive ? token.colorPrimaryBgHover : 'inherit',
	};
	return (
		<Flex justify="center" align="center" vertical style={mobile ? { flex: 1 } : {}}>
			<Button
				type='text'
				style={mobile ? style : {}}
			>
				<Flex justify="center" align="center" vertical className='flex-menu-item' style={{ color: isActive ?  token.colorPrimary : 'inherit' }} >
					{icon}
					<Link to={to} style={{ color: isActive ?  token.colorPrimary : 'inherit' }}>{label}</Link>
				</Flex>
			</Button>
		</Flex>
	);
};

export default MenuItem;