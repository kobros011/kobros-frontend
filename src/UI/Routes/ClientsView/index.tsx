import { Card } from 'antd';
import { FC } from 'react';
import { Layout } from './layout';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';


const ClientsView: FC = () => {
	const isMobile = useUserModeStore(state => state.isMobile);

	// En móvil no hay Card anidado: el contenido va directo sobre el fondo del layout.
	return (
		<Card
			variant={isMobile ? 'borderless' : 'outlined'}
			style={isMobile ? { background: 'transparent' } : undefined}
			styles={isMobile ? { body: { padding: 0 } } : undefined}
		>
			<Layout />
		</Card>
	);
};

export default ClientsView;
