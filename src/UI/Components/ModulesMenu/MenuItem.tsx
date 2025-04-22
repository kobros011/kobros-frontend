import { Button, Flex, Tooltip } from 'antd';
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface MenuItemProps {
	label: string, 
	icon: ReactNode, 
	path: string
	mobile: boolean
}

const MenuItem: FC<MenuItemProps> = ({ label, path, icon, mobile }) => {

	const style = { height: 'auto', paddingTop: 5 };
	return (
		<Flex justify="center" align="center" vertical>
			<Link to={path}>
				<Tooltip title={label} placement="right">
					<Button 
						type="text" 
						variant="outlined"
						style={mobile ? style : {}}
					>   
						<Flex justify="center" align="center" vertical>
							{icon}
							<span>{label}</span>
						</Flex>
					</Button>
				</Tooltip>
			</Link>
		</Flex>
	);
};

export default MenuItem;