import { FC, ReactNode } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { ReloadOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyReports } from '@/constants/queryKeys';
import { DashCard, IconBox, Pill } from './ui';
import { DashboardFiltersState } from './useDashboardFilters';

interface DashboardFiltersProps {
	title: string;
	subtitle: string;
	icon: ReactNode;
	filters: DashboardFiltersState;
	/** Texto del pill junto al título (ej. "3 Rutas activas"). */
	badge?: string;
	/** Control adicional (ej. selector de período) que se muestra junto a los filtros. */
	extra?: ReactNode;
}

/** Quita el sufijo entre paréntesis del nombre ("Carlos Vargas (Recaudador)" → "Carlos Vargas"). */
export const shortName = (fullName: string) => fullName.replace(/\s*\(.*?\)/, '');

/** Banner de cabecera con filtros Ruta y Recaudador + refrescar. No incluye filtro de período. */
export const DashboardFilters: FC<DashboardFiltersProps> = ({ title, subtitle, icon, filters, badge, extra }) => {
	const queryClient = useQueryClient();

	return (
		<DashCard>
			<div className="kb-banner">
				<div className="kb-banner-title">
					<IconBox icon={icon} />
					<div style={{ minWidth: 0 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
							<h2 className="kb-section-title" style={{ fontSize: 18 }}>{title}</h2>
							{badge && <Pill tone="ok">{badge}</Pill>}
						</div>
						<div className="kb-section-sub">{subtitle}</div>
					</div>
				</div>

				<div className="kb-filters">
					<div className="kb-filter">
						<EnvironmentOutlined style={{ color: 'var(--kb-primary)' }} />
						<span className="kb-filter-label">Ruta:</span>
						<Select
							aria-label="Filtrar por ruta"
							value={filters.routeId ?? 'all'}
							onChange={value => filters.setRouteId(value === 'all' ? undefined : value)}
							variant="borderless"
							popupMatchSelectWidth={false}
							style={{ minWidth: 150 }}
							options={[
								{ value: 'all', label: `Todas las rutas (${filters.availableRoutes.length})` },
								...filters.availableRoutes.map(route => ({ value: route.id, label: route.name })),
							]}
						/>
					</div>
					<div className="kb-filter">
						<TeamOutlined style={{ color: 'var(--kb-primary)' }} />
						<span className="kb-filter-label">Recaudador:</span>
						<Select
							aria-label="Filtrar por recaudador"
							value={filters.collectorId ?? 'all'}
							onChange={value => filters.setCollectorId(value === 'all' ? undefined : value)}
							variant="borderless"
							popupMatchSelectWidth={false}
							style={{ minWidth: 170 }}
							options={[
								{ value: 'all', label: `Todos (${filters.availableCollectors.length})` },
								...filters.availableCollectors.map(collector => ({ value: collector.id, label: shortName(collector.full_name) })),
							]}
						/>
					</div>
					{extra}
					<Tooltip title="Actualizar datos">
						<Button
							aria-label="Actualizar datos"
							icon={<ReloadOutlined />}
							style={{ width: 44, height: 44, borderRadius: 12 }}
							onClick={() => void queryClient.invalidateQueries({ queryKey: [queryKeyReports.base] })}
						/>
					</Tooltip>
				</div>
			</div>
		</DashCard>
	);
};
