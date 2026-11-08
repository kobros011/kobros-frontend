import { FC } from 'react';

import { Empty } from 'antd';

import { ApartmentOutlined } from '@ant-design/icons';

import { Link } from 'react-router-dom';

import routePaths from '@/constants/routePaths';
import { Pill, SectionCard } from '@/UI/Components/Dashboard/ui';

import { StackedBar } from '@/UI/Components/Dashboard/charts';

import { formatPercent } from '@/UI/Components/Dashboard/format';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';

import { RouteRowDto } from '@/infrastructure/dto/DashboardDto';
import { useMoney } from '@/infrastructure/hooks/useMoney';


export const RouteBreakdownCard: FC<{ rows: RouteRowDto[] }> = ({ rows }) =>{
	const money = useMoney();
	return (
		<SectionCard
			icon={<ApartmentOutlined />}
			title="Cartera por ruta (activa vs. mora)"
			subtitle="Comparativo de capital prestado vs. monto vencido"
			extra={<div className="kb-legend"><span><span className="kb-dot kb-tone-primary" /> Activa</span><span><span className="kb-dot kb-tone-danger" /> Mora</span></div>}
			footer={<><span>* Ordenado por volumen gestionado</span><Link className="kb-link" to={`/${routePaths.DEFAULT_HOME}/${routePaths.PAYMENTS}`}>Ver cartera →</Link></>}
		>
			{rows.length === 0 ? <Empty description="Sin rutas" /> : (
				<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					{rows.map(row => (
						<div key={row.route_id}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
								<div><strong>{row.route_name}</strong> <span className="kb-section-sub">Recaudador: {row.collector_names.map(shortName).join(', ') || '—'}</span></div>
								<div className="kb-mono" style={{ fontSize: 12 }}>
									<span style={{ color: 'var(--kb-primary)' }}>{money.compact(row.active)}</span> / Mora: <span style={{ color: 'var(--kb-danger)' }}>{money.compact(row.late)}</span>{' '}
									<Pill tone={row.rate >= 20 ? 'danger' : row.rate >= 10 ? 'warn' : 'ok'}>{formatPercent(row.rate)} {row.rate >= 20 ? 'alerta' : row.rate < 10 ? 'baja' : ''}</Pill>
								</div>
							</div>
							<StackedBar active={Math.max(row.active - row.late, 0)} delinquency={row.late} />
						</div>
					))}
				</div>
			)}
		</SectionCard>
	);
};
