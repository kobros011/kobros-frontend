import { FC, useState } from 'react';
import { Button } from 'antd';
import { ControlOutlined, LockOutlined } from '@ant-design/icons';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { getRouteClients } from '@/infrastructure/querys/ClientRoute';
import { PriorityBadge } from './PriorityChip';
import { PriorityDrawer } from './PriorityDrawer';
import { useCanManagePriority } from './usePriorityAccess';
import './priority.css';

interface LoanPriorityCardProps {
	clientId?: string
	routeId?: string
	routeName?: string
	fullName?: string
	idDocument?: string
	currentMobile?: string
	/** Prioridad guardada en el crédito (se usa mientras carga la de la ruta). */
	order?: number
}

/** Ficha del crédito: "#4 de 38 en Ruta Norte" con "Cambiar prioridad" (administración) o candado (cobrador/socio). */
export const LoanPriorityCard: FC<LoanPriorityCardProps> = ({ clientId, routeId, routeName, fullName, idDocument, currentMobile, order }) => {
	const canManage = useCanManagePriority();
	const [open, setOpen] = useState(false);
	const { routeClients } = getRouteClients(routeId);
	const mine = routeClients.find(item => item.clientId === clientId);
	const position = mine?.order ?? order;
	if (!clientId || !position) return null;

	return (
		<DashboardShell>
			<section className="pr-card" aria-label="Prioridad en la ruta">
				<div className="pr-label" style={{ margin: 0 }}>{canManage ? 'Prioridad en ruta' : 'Prioridad en ruta (solo lectura)'}</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<PriorityBadge order={position} size={44} />
					<div>
						<div style={{ fontWeight: 700 }}>de {routeClients.length || '—'} clientes en {routeName ?? 'la ruta'}</div>
						{!canManage && <div style={{ fontSize: 11, color: 'var(--kb-muted)' }}><LockOutlined /> La define la administración.</div>}
					</div>
				</div>
				{canManage && <Button size="small" type="primary" icon={<ControlOutlined />} onClick={() => setOpen(true)}>Cambiar prioridad</Button>}
			</section>
			<PriorityDrawer open={open} canManage={canManage} client={{ id: clientId, fullName: fullName ?? '', idDocument: idDocument ?? '', currentMobile: currentMobile ?? '' }} onClose={() => setOpen(false)} />
		</DashboardShell>
	);
};
