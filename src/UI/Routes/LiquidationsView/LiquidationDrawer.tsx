import { FC } from 'react';
import { Drawer } from 'antd';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { LiquidationDetail } from './LiquidationDetail';

interface LiquidationDrawerProps {
	id?: string;
	isAdmin: boolean;
	onClose: () => void;
}

/** Panel de auditoría de un cierre: lateral en escritorio, hoja inferior en móvil. */
export const LiquidationDrawer: FC<LiquidationDrawerProps> = ({ id, isAdmin, onClose }) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	return (
		<Drawer
			open={!!id}
			onClose={onClose}
			placement={isMobile ? 'bottom' : 'right'}
			height={isMobile ? '85%' : undefined}
			width={isMobile ? undefined : 460}
			title="Auditoría del cierre"
			destroyOnClose
			styles={{ body: { padding: 14 } }}
		>
			{id && <div className="kb-dash"><LiquidationDetail id={id} isAdmin={isAdmin} onDone={onClose} /></div>}
		</Drawer>
	);
};
