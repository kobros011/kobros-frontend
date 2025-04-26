import { Button, Flex } from 'antd';
import { FC, ReactNode } from 'react';

interface MenuItemProps {
	label: ReactNode, 
	icon: ReactNode,
	mobile: boolean
}

const MenuItem: FC<MenuItemProps> = ({ label, icon, mobile }) => {

	const style = { height: 'auto', paddingTop: 5 };
	return (
		<Flex justify="center" align="center" vertical>
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
		</Flex>
	);
};

export default MenuItem;