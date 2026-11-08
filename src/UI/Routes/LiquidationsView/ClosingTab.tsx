import { FC, useState } from 'react';
import { Alert, Empty, Skeleton } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getLiquidationPreview } from '@/infrastructure/querys/Liquidation';
import { ClosingFilters } from './ClosingFilters';
import { ClosingForm } from './ClosingForm';
import { LiquidationDetail } from './LiquidationDetail';
import { CollectionCard, ExpensesCard, GoalCard, NewLoansCard } from './SummaryCards';

/** "Cierre del día": si ya hay cierre se muestra en solo lectura; si no, cifras automáticas + datos de cierre y cuadre. */
export const ClosingTab: FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
	const [routeId, setRouteId] = useState<string>();
	const [date, setDate] = useState<Dayjs>(dayjs());
	const [collectorId, setCollectorId] = useState<string>();

	const { preview, isLoading, isError, refetch } = getLiquidationPreview({
		route_id: routeId, date: date.format('YYYY-MM-DD'), collector_id: collectorId,
	});

	return (
		<div className="lq-stack">
			<ClosingFilters
				routeId={routeId} onRouteChange={setRouteId} date={date} onDateChange={setDate}
				isAdmin={isAdmin} collectorId={collectorId} onCollectorChange={setCollectorId}
			/>

			{!routeId && <Empty description="Selecciona una ruta para ver o cerrar la caja del día" />}
			{routeId && isLoading && !preview && <Skeleton active paragraph={{ rows: 8 }} />}
			{routeId && isError && (
				<Alert type="error" showIcon message="No se pudo calcular el cierre" action={<a onClick={() => void refetch()}>Reintentar</a>} />
			)}

			{preview && preview.existing_liquidation_id && (
				<LiquidationDetail id={preview.existing_liquidation_id} isAdmin={isAdmin} />
			)}

			{preview && !preview.existing_liquidation_id && (
				<div className="lq-grid">
					<div className="lq-stack">
						<CollectionCard figures={preview} />
						<NewLoansCard total={preview.new_loans_total} loans={preview.new_loans} />
						<div className="lq-pair">
							<ExpensesCard total={preview.expenses_total} expenses={preview.expenses} />
							<GoalCard figures={preview} percent={preview.progress_percent} />
						</div>
					</div>
					<div className="lq-stack">
						<ClosingForm preview={preview} collectorId={collectorId} />
					</div>
				</div>
			)}
		</div>
	);
};
