import { FC } from 'react';
import { Flex, Segmented } from 'antd';
import ViewSwitcher from '@/UI/Components/Table/ViewSwitcher';
import { ViewMode } from '@/infrastructure/context/TableViewStore';
import { PaymentHistoryStatus, PaymentHistorySummaryDto } from '@/infrastructure/dto/PaymentHistoryDto';

export type HistoryFilter = PaymentHistoryStatus | 'todas';

interface HistoryFiltersProps {
	summary: PaymentHistorySummaryDto;
	value: HistoryFilter;
	onChange: (value: HistoryFilter) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

/** Filtros rápidos por estado (con conteos) y selector tarjetas/tabla. */
export const HistoryFilters: FC<HistoryFiltersProps> = ({ summary, value, onChange, viewMode, onViewModeChange }) => (
	<Flex justify="space-between" align="center" gap={8} wrap="wrap" style={{ marginBottom: 14 }}>
		<Segmented<HistoryFilter>
			size="small"
			value={value}
			onChange={onChange}
			aria-label="Filtrar cuotas por estado"
			options={[
				{ value: 'todas', label: 'Todas' },
				{ value: 'mora', label: `En mora (${summary.overdue})` },
				{ value: 'pagado', label: `Pagadas (${summary.paid})` },
				{ value: 'pendiente', label: `Pendientes (${summary.pending})` },
			]}
		/>
		<ViewSwitcher value={viewMode} onChange={onViewModeChange} size="small" />
	</Flex>
);
