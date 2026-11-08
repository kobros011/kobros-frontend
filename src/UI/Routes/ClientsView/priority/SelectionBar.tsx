import { FC } from 'react';
import { Button, theme } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { pluralClients } from './moveLogic';

interface SelectionBarProps {
	count: number
	routeLabel?: string
	onCancel: () => void
	onMove: () => void
}

/** Barra flotante de la selección masiva: abajo y centrada en escritorio; sobre la barra de navegación en móvil. */
export const SelectionBar: FC<SelectionBarProps> = ({ count, routeLabel, onCancel, onMove }) => {
	const { token } = theme.useToken();
	const isMobile = useUserModeStore(state => state.isMobile);
	return (
		<aside
			role="region"
			aria-label="Acciones de la selección"
			style={{
				position: 'fixed', zIndex: 50, left: 0, right: 0, margin: '0 auto', bottom: isMobile ? 68 : 24,
				width: isMobile ? 'calc(100% - 16px)' : 'min(560px, calc(100% - 32px))',
				display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px',
				background: token.colorBgElevated, border: `2px solid ${token.colorPrimary}66`, borderRadius: 16, boxShadow: token.boxShadowSecondary,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
				<span className="kb-mono" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: `${token.colorPrimary}33`, color: token.colorPrimary, fontWeight: 800 }}>
					{count}
				</span>
				<div style={{ minWidth: 0 }}>
					<div style={{ fontWeight: 700, fontSize: 13 }}>{pluralClients(count)} {count === 1 ? 'seleccionado' : 'seleccionados'}</div>
					{routeLabel && <div style={{ fontSize: 11, color: token.colorTextTertiary }}>{routeLabel}</div>}
				</div>
			</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<Button size="small" danger onClick={onCancel}>Cancelar</Button>
				<Button size="small" type="primary" icon={<DragOutlined />} onClick={onMove} disabled={count === 0}>Mover…</Button>
			</div>
		</aside>
	);
};
