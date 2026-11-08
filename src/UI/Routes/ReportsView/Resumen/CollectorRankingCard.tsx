import { FC } from 'react';
import { Empty } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { RankBar, toneByCompliance } from '@/UI/Components/Dashboard/charts';
import { formatCOP, formatCompactCOP, formatPercent } from '@/UI/Components/Dashboard/format';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { CollectorRowDto } from '@/infrastructure/dto/DashboardDto';

export const CollectorRankingCard: FC<{ rows: CollectorRowDto[]; averageGoal: number }> = ({ rows, averageGoal }) => (
	<SectionCard
		icon={<TrophyOutlined />}
		title="Desempeño por recaudador"
		subtitle="Ranking de cumplimiento: cobrado vs. colocado"
		extra={<Pill tone="neutral">Corte actual</Pill>}
		footer={<><span>Meta promedio: {formatCOP(averageGoal)} / recaudador</span><Link className="kb-link" to={`/${routePaths.DEFAULT_HOME}/${routePaths.USERS}`}>Ver usuarios →</Link></>}
	>
		{rows.length === 0 ? <Empty description="No hay recaudadores con rutas asignadas" /> : (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				{rows.map((row, index) => {
					const tone = toneByCompliance(row.percent);
					return (
						<div key={row.collector_id} className="kb-row">
							<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
								<span className="kb-rank">{index + 1}</span>
								<div style={{ flex: 1, minWidth: 0 }}>
									<strong>{shortName(row.full_name)}</strong> <span className="kb-section-sub">{row.route_names.join(', ')}</span>
								</div>
								<span className="kb-mono" style={{ fontSize: 12 }}>{formatCompactCOP(row.collected)} / {formatCompactCOP(row.goal)}</span>
								<Pill tone={tone}>{formatPercent(row.percent)}</Pill>
							</div>
							<RankBar percent={row.percent} tone={tone} />
						</div>
					);
				})}
			</div>
		)}
	</SectionCard>
);
