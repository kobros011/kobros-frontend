import { FC } from 'react';
import { Drawer } from 'antd';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { getLiquidationDetail } from '@/infrastructure/querys/Liquidation';
import { LiquidationDetail } from './LiquidationDetail';
import { formatDay } from './statusMeta';

interface LiquidationDrawerProps {
	id?: string;
	isAdmin: boolean;
	onClose: () => void;
}

/** Panel de auditoría de un cierre: lateral en escritorio, hoja inferior en móvil. */
export const LiquidationDrawer: FC<LiquidationDrawerProps> = ({ id, isAdmin, onClose }) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const { detail } = getLiquidationDetail(id); // misma consulta que el detalle: no hay segunda petición
	const who = detail ? `${detail.route_name} · ${detail.collector_name ? shortName(detail.collector_name) : 'Consolidado de la ruta'}` : undefined;

	return (
		<Drawer
			open={!!id}
			onClose={onClose}
			placement={isMobile ? 'bottom' : 'right'}
			height={isMobile ? '85%' : undefined}
			width={isMobile ? undefined : 480}
			title={(
				<div>
					<div>{detail ? `Auditoría · ${formatDay(detail.date)}` : 'Auditoría del cierre'}</div>
					{who && <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.65 }}>{who}</div>}
				</div>
			)}
			destroyOnClose
			styles={{ body: { padding: 14 } }}
		>
			{id && <DashboardShell><LiquidationDetail id={id} isAdmin={isAdmin} onDone={onClose} /></DashboardShell>}
		</Drawer>
	);
};
