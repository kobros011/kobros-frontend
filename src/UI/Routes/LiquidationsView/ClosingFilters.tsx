import { FC, useMemo } from 'react';
import { DatePicker, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { SelectRoute } from '@components/Fields/SelectRoute';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { getDashboardFilters } from '@/infrastructure/querys/Report';

interface ClosingFiltersProps {
	routeId?: string;
	onRouteChange: (id?: string) => void;
	date: Dayjs;
	onDateChange: (date: Dayjs) => void;
	/** Solo el admin elige cobrador; el cobrador siempre cierra el suyo. */
	isAdmin: boolean;
	collectorId?: string;
	onCollectorChange: (id?: string) => void;
}

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<label className="lq-field" style={{ flex: '1 1 170px' }}>
		<span className="kb-section-sub">{label}</span>
		{children}
	</label>
);

/** Ruta operativa · Fecha de liquidación · Cobrador asignado (este último solo para admin). */
export const ClosingFilters: FC<ClosingFiltersProps> = ({ routeId, onRouteChange, date, onDateChange, isAdmin, collectorId, onCollectorChange }) => {
	const { filters } = getDashboardFilters(isAdmin);
	const collectors = useMemo(() => {
		const route = filters?.routes.find(item => item.id === routeId);
		if (!route) return [];
		return (filters?.collectors ?? []).filter(item => route.collector_ids.includes(item.id));
	}, [filters, routeId]);

	return (
		<div className="lq-filters">
			<Field label="Ruta operativa">
				<SelectRoute size="small" aria-label="Ruta operativa" value={routeId} onChange={value => { onRouteChange(value); onCollectorChange(undefined); }} placeholder="Selecciona una ruta" />
			</Field>
			<Field label="Fecha de liquidación">
				<DatePicker
					size="small"
					aria-label="Fecha de liquidación"
					value={date}
					allowClear={false}
					format="DD/MM/YYYY"
					disabledDate={current => current.isAfter(dayjs(), 'day')}
					onChange={value => value && onDateChange(value)}
				/>
			</Field>
			{isAdmin && (
				<Field label="Cobrador asignado">
					<Select
						size="small"
						aria-label="Cobrador asignado"
						value={collectorId ?? 'all'}
						disabled={!routeId}
						onChange={value => onCollectorChange(value === 'all' ? undefined : value)}
						options={[{ value: 'all', label: 'Consolidado de la ruta' }, ...collectors.map(item => ({ value: item.id, label: shortName(item.full_name) }))]}
					/>
				</Field>
			)}
		</div>
	);
};
