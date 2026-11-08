import { FC, useEffect, useState } from 'react';
import { Empty, Pagination, Result, Spin } from 'antd';
import { getPaymentHistory } from '@/infrastructure/querys/Payment';
import { usePagination } from '@/infrastructure/hooks/usePagination';
import useTableViewStore from '@/infrastructure/context/TableViewStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { HistoryFilter, HistoryFilters } from './HistoryFilters';
import { HistorySummary } from './HistorySummary';
import { HistoryTable } from './HistoryTable';
import { QuotaCardItem } from './QuotaCardItem';

const HISTORY_MODULE = 'payment-history';

/** Historial de cuotas de un crédito: resumen, filtros por estado y vista tarjetas o tabla con paginación del servidor. */
export const PaymentsHistory: FC<{ loanId: string }> = ({ loanId }) => {
	const [filter, setFilter] = useState<HistoryFilter>('todas');
	const { page, pageSize, onChange, clampToTotal } = usePagination(filter);

	const isMobile = useUserModeStore(state => state.isMobile);
	const modulePrefs = useTableViewStore(state => state.modules[HISTORY_MODULE]);
	const setViewMode = useTableViewStore(state => state.setViewMode);
	const viewMode = modulePrefs?.viewMode ?? (isMobile ? 'list' : 'table');

	const { history, isLoading, isError, isFetching } = getPaymentHistory(
		loanId,
		filter === 'todas' ? undefined : filter,
		{ page, pageSize },
	);
	const total = history?.total ?? 0;
	useEffect(() => clampToTotal(total), [total, clampToTotal]);

	if (isLoading && !history) {
		return <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin tip="Cargando pagos…" /></div>;
	}
	if (isError || !history) {
		return <Result status="error" title="No se pudo cargar el historial de pagos" subTitle="Intenta cerrar y volver a abrir el crédito." />;
	}
	if (history.summary.total_quotas === 0) {
		return <Empty description="Este crédito aún no tiene pagos registrados" />;
	}

	return (
		<DashboardShell>
			<HistorySummary summary={history.summary} />
			<HistoryFilters
				summary={history.summary}
				value={filter}
				onChange={setFilter}
				viewMode={viewMode}
				onViewModeChange={mode => setViewMode(HISTORY_MODULE, mode)}
			/>

			{viewMode === 'table' ? (
				<HistoryTable
					items={history.items}
					summary={history.summary}
					loading={isFetching}
					total={total}
					page={page}
					pageSize={pageSize}
					onPageChange={onChange}
				/>
			) : (
				<Spin spinning={isFetching}>
					{history.items.length === 0 ? <Empty description="No hay cuotas con este estado" /> : (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
							{history.items.map(item => <QuotaCardItem key={item.id} item={item} />)}
						</div>
					)}
					<div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
						<Pagination
							size="small"
							current={page}
							pageSize={pageSize}
							total={total}
							showSizeChanger
							pageSizeOptions={PAGE_SIZE_OPTIONS}
							onChange={onChange}
						/>
					</div>
				</Spin>
			)}
		</DashboardShell>
	);
};
