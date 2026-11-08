import { FC } from 'react';
import { Tabs } from 'antd';
import { BankOutlined, CheckCircleOutlined, HistoryOutlined, ReconciliationOutlined } from '@ant-design/icons';
import { DashCard, IconBox, Pill } from '@/UI/Components/Dashboard/ui';

export type LiquidationTab = 'cierre' | 'historial' | 'pendientes';

interface LiquidationsBannerProps {
	tab: LiquidationTab;
	onTabChange: (tab: LiquidationTab) => void;
	isAdmin: boolean;
	pendingCount: number;
}

/** Encabezado del módulo: título, chip de cierres por confirmar y pestañas (la última solo para admin). */
export const LiquidationsBanner: FC<LiquidationsBannerProps> = ({ tab, onTabChange, isAdmin, pendingCount }) => {
	const items = [
		{ key: 'cierre', label: <span><ReconciliationOutlined /> Cierre del día</span> },
		{ key: 'historial', label: <span><HistoryOutlined /> Historial de cierres</span> },
		...(isAdmin ? [{ key: 'pendientes', label: <span><CheckCircleOutlined /> Por confirmar{pendingCount > 0 ? ` (${pendingCount})` : ''}</span> }] : []),
	];

	return (
		<DashCard>
			<div className="kb-banner">
				<div className="kb-banner-title">
					<IconBox icon={<BankOutlined />} />
					<div style={{ minWidth: 0 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
							<h2 className="kb-section-title" style={{ fontSize: 18 }}>Liquidaciones y cuadre de rutas</h2>
							{isAdmin && pendingCount > 0 && <Pill tone="warn">{pendingCount} por confirmar</Pill>}
						</div>
						<div className="kb-section-sub">Cierre de caja diario, validación de gastos y auditoría de recaudos</div>
					</div>
				</div>
			</div>
			<Tabs size="small" activeKey={tab} items={items} onChange={key => onTabChange(key as LiquidationTab)} style={{ marginTop: 8 }} />
		</DashCard>
	);
};
