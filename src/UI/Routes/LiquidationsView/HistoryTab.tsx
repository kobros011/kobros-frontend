import { FC, useEffect, useState } from 'react';
import { Alert, DatePicker, Empty, Pagination, Select, Skeleton } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { SelectRoute } from '@components/Fields/SelectRoute';
import ViewSwitcher from '@/UI/Components/Table/ViewSwitcher';
import { Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { getDashboardFilters } from '@/infrastructure/querys/Report';
import { getLiquidationPage } from '@/infrastructure/querys/Liquidation';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import useTableViewStore from '@/infrastructure/context/TableViewStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';
import { LiquidationStatus } from '@/infrastructure/dto/LiquidationDto';
import { HistoryCards } from './HistoryCards';
import { HistoryTable } from './HistoryTable';
import { LiquidationDrawer } from './LiquidationDrawer';

const MODULE = 'liquidations';
const STATUS_OPTIONS = [
	{ value: 'all', label: 'Todos los estados' },
	{ value: 'pendiente', label: 'Pendiente' },
	{ value: 'confirmada', label: 'Confirmada' },
	{ value: 'reabierta', label: 'Reabierta' },
];

/** Historial de cierres: tabla o tarjetas (se recuerda la vista), filtros, totales del período y panel de auditoría. */
export const HistoryTab: FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
	const isMobile = useUserModeStore(state => state.isMobile);
	const prefs = useTableViewStore(state => state.modules[MODULE]);
	const setViewMode = useTableViewStore(state => state.setViewMode);
	const viewMode = prefs?.viewMode ?? (isMobile ? 'list' : 'table');

	const [routeId, setRouteId] = useState<string>();
	const [collectorId, setCollectorId] = useState<string>();
	const [status, setStatus] = useState<LiquidationStatus>();
	const [range, setRange] = useState<[Dayjs, Dayjs] | null>([dayjs().startOf('month'), dayjs()]);
	const [openId, setOpenId] = useState<string>();

	const filters = {
		route_id: routeId, collector_id: collectorId, status,
		date_from: range?.[0].format('YYYY-MM-DD'), date_to: range?.[1].format('YYYY-MM-DD'),
	};
	const { page, pageSize, onChange, clampToTotal } = usePagination(JSON.stringify(filters));
	const { page: result, isLoading, isError, isFetching, refetch } = getLiquidationPage(filters, { page, pageSize });
	const { filters: dashFilters } = getDashboardFilters(isAdmin);
	const total = result?.total ?? 0;
	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	return (
		<>
			<SectionCard
				icon={<HistoryOutlined />}
				title="Historial de cierres de caja"
				subtitle="Registro consolidado de arqueos por ruta, cobrador y fecha de liquidación"
				extra={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Pill tone="ok">{total} liquidaciones</Pill><ViewSwitcher size="small" value={viewMode} onChange={mode => setViewMode(MODULE, mode)} /></div>}
			>
				<div className="lq-filters" style={{ marginBottom: 12 }}>
					<SelectRoute size="small" aria-label="Filtrar por ruta" allowClear placeholder="Todas las rutas" value={routeId} onChange={value => setRouteId(value)} />
					{isAdmin && (
						<Select size="small" aria-label="Filtrar por cobrador" allowClear placeholder="Todos los cobradores" value={collectorId} onChange={value => setCollectorId(value)}
							options={(dashFilters?.collectors ?? []).map(item => ({ value: item.id, label: shortName(item.full_name) }))} />
					)}
					<DatePicker.RangePicker size="small" aria-label="Rango de fechas" allowClear={false} format="DD/MM/YYYY" value={range}
						onChange={value => value?.[0] && value?.[1] && setRange([value[0], value[1]])} />
					<Select size="small" aria-label="Filtrar por estado" value={status ?? 'all'} options={STATUS_OPTIONS}
						onChange={value => setStatus(value === 'all' ? undefined : (value as LiquidationStatus))} />
				</div>

				{isError && <Alert type="error" showIcon message="No se pudo cargar el historial" action={<a onClick={() => void refetch()}>Reintentar</a>} />}
				{isLoading && !result && <Skeleton active paragraph={{ rows: 6 }} />}
				{result && result.items.length === 0 && <Empty description="Aún no hay cierres con estos filtros" />}
				{result && result.items.length > 0 && (viewMode === 'table'
					? <HistoryTable items={result.items} summary={result.summary} loading={isFetching} total={total} page={page} pageSize={pageSize} onPageChange={onChange} onOpen={setOpenId} />
					: <>
						<HistoryCards items={result.items} onOpen={setOpenId} />
						<div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
							<Pagination size="small" current={page} pageSize={pageSize} total={total} showSizeChanger pageSizeOptions={PAGE_SIZE_OPTIONS} onChange={onChange} />
						</div>
					</>)}
			</SectionCard>

			<LiquidationDrawer id={openId} isAdmin={isAdmin} onClose={() => setOpenId(undefined)} />
		</>
	);
};
