import './priority.css';
import { FC, ReactNode } from 'react';
import { Drawer, Modal } from 'antd';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';

interface ResponsivePanelProps {
	open: boolean
	title: ReactNode
	subtitle?: ReactNode
	onClose: () => void
	footer?: ReactNode
	/** `modal` en escritorio y hoja inferior en móvil, o `drawer` lateral en escritorio (y hoja inferior en móvil). */
	variant?: 'modal' | 'drawer'
	children: ReactNode
}

/** Contenedor común de la prioridad: modal/drawer en escritorio, hoja inferior en móvil. Envuelve en `DashboardShell` para heredar los tokens `kb-*`. */
export const ResponsivePanel: FC<ResponsivePanelProps> = ({ open, title, subtitle, onClose, footer, variant = 'modal', children }) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const heading = (
		<div>
			<div style={{ fontWeight: 700 }}>{title}</div>
			{subtitle && <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.65 }}>{subtitle}</div>}
		</div>
	);

	if (isMobile || variant === 'drawer') {
		return (
			<Drawer
				open={open}
				onClose={onClose}
				title={heading}
				placement={isMobile ? 'bottom' : 'right'}
				height={isMobile ? '85%' : undefined}
				width={isMobile ? undefined : 480}
				destroyOnClose
				footer={footer}
				styles={{ body: { padding: 14 } }}
			>
				<DashboardShell>{children}</DashboardShell>
			</Drawer>
		);
	}

	return (
		<Modal open={open} onCancel={onClose} title={heading} footer={footer} width={520} centered destroyOnClose>
			<DashboardShell>{children}</DashboardShell>
		</Modal>
	);
};
