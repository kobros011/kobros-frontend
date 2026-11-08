import { FC, useMemo, useState } from 'react';

import { Alert, DatePicker, Empty, Table } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { CalendarOutlined, DollarOutlined, FallOutlined, RiseOutlined, WalletOutlined } from '@ant-design/icons';

import dayjs, { Dayjs } from 'dayjs';
import { getPeriodReport } from '@/infrastructure/querys/Report';

import { DashboardParams, PeriodMode } from '@/infrastructure/dto/DashboardDto';
import { CurrencyBlocks } from '@/UI/Components/CurrencyTabs';

import { ReportsLayout } from './ReportsLayout';

import { DashboardShell, KpiCard, Pill, SectionCard } from '@/UI/Components/Dashboard/ui';

import { DashboardFilters } from '@/UI/Components/Dashboard/DashboardFilters';

import { useDashboardFilters } from '@/UI/Components/Dashboard/useDashboardFilters';

import { PeriodChart, PeriodPoint } from '@/UI/Components/Dashboard/charts';

import { formatPercent } from '@/UI/Components/Dashboard/format';
import { useMoney } from '@/infrastructure/hooks/useMoney';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Un bloque del reporte: cifras, gráfica y detalle de una sola moneda (la del `CurrencyProvider` que lo envuelve). */
const PeriodBlock: FC<{ mode: PeriodMode; picked: Dayjs | null; params: DashboardParams }> = ({ mode, picked, params }) => {
	const money = useMoney();
	const isWeekly = mode === 'weekly';
	const { report, isLoading, isError } = getPeriodReport(mode, picked?.format('YYYY-MM-DD'), params);

	const data = useMemo<PeriodPoint[]>(() => (report?.buckets ?? []).map((bucket, index) => ({
		label: isWeekly ? `${DAY_LABELS[index]} ${bucket.date.slice(8, 10)}` : MONTH_LABELS[index],
		collected: bucket.collected,
		expenses: bucket.expenses,
		profit: bucket.profit,
	})), [report, isWeekly]);

	const start = report ? dayjs(report.start) : dayjs();
	const totals = report?.totals ?? { collected: 0, expenses: 0, profit: 0, margin: 0 };
	const hasData = totals.collected > 0 || totals.expenses > 0;
	const profitTone = totals.profit < 0 ? 'danger' : 'ok';

	const rangeLabel = isWeekly
		? `${start.format('DD MMM')} – ${start.add(6, 'day').format('DD MMM YYYY')}`
		: start.format('YYYY');

	const columns: ColumnsType<PeriodPoint> = [
		{ title: isWeekly ? 'Día' : 'Mes', dataIndex: 'label', key: 'label' },
		{ title: 'Recaudo', dataIndex: 'collected', key: 'collected', align: 'right', render: (value: number) => money(value) },
		{ title: 'Gastos', dataIndex: 'expenses', key: 'expenses', align: 'right', render: (value: number) => money(value) },
		{
			title: 'Utilidad',
			dataIndex: 'profit',
			key: 'profit',
			align: 'right',
			render: (value: number) => <strong style={{ color: value < 0 ? 'var(--kb-danger)' : undefined }}>{money(value)}</strong>,
		},
	];

	return (
		<>
			{isError && <Alert type="error" showIcon message="No se pudo cargar el reporte. Intenta actualizar los datos." />}

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
				<KpiCard label="Recaudo" subtitle={rangeLabel} value={money(totals.collected)} icon={<WalletOutlined />} tone="primary" />
				<KpiCard label="Gastos" subtitle={rangeLabel} value={money(totals.expenses)} icon={<FallOutlined />} tone="warn" />
				<KpiCard
					label="Utilidad"
					subtitle="Recaudo − gastos"
					value={money(totals.profit)}
					valueTone={profitTone}
					icon={totals.profit < 0 ? <FallOutlined /> : <RiseOutlined />}
					tone={profitTone}
					pill={<Pill tone={profitTone}>Margen {formatPercent(totals.margin)}</Pill>}
				/>
			</div>

			<SectionCard
				icon={<DollarOutlined />}
				title={isWeekly ? 'Evolución diaria' : 'Evolución mensual'}
				subtitle="Barras: recaudo y gastos · Línea: utilidad"
			>
				{isLoading ? null : hasData ? (
					<PeriodChart data={data} />
				) : (
					<Empty description="Sin movimientos en este período. Cambia la fecha o los filtros." />
				)}
			</SectionCard>

			<SectionCard icon={<CalendarOutlined />} title="Detalle del período" subtitle={isWeekly ? 'Por día' : 'Por mes'}>
				<Table<PeriodPoint>
					size="small"
					rowKey="label"
					columns={columns}
					dataSource={data}
					pagination={false}
					scroll={{ x: 'max-content' }}
					loading={isLoading}
					summary={() => (
						<Table.Summary.Row>
							<Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
							<Table.Summary.Cell index={1} align="right"><strong>{money(totals.collected)}</strong></Table.Summary.Cell>
							<Table.Summary.Cell index={2} align="right"><strong>{money(totals.expenses)}</strong></Table.Summary.Cell>
							<Table.Summary.Cell index={3} align="right">
								<strong style={{ color: totals.profit < 0 ? 'var(--kb-danger)' : undefined }}>{money(totals.profit)}</strong>
							</Table.Summary.Cell>
						</Table.Summary.Row>
					)}
				/>
			</SectionCard>
		</>
	);
};

/** Reporte de recaudo, gastos y utilidad por semana (7 días) o por año (12 meses); un bloque por moneda. */
const PeriodReport: FC<{ mode: PeriodMode }> = ({ mode }) => {
	const isWeekly = mode === 'weekly';
	const filters = useDashboardFilters();
	// Sin fecha elegida, el servidor usa el último período con movimientos.
	const [picked, setPicked] = useState<Dayjs | null>(null);
	const { currencies } = filters;
	// Misma consulta que el primer bloque (queda en caché): da el período que muestran la cabecera y el selector.
	const { report } = getPeriodReport(mode, picked?.format('YYYY-MM-DD'), { ...filters.params, currency: currencies[0] });
	const start = report ? dayjs(report.start) : dayjs();
	const period = picked ?? start;
	const rangeLabel = isWeekly
		? `${start.format('DD MMM')} – ${start.add(6, 'day').format('DD MMM YYYY')}`
		: start.format('YYYY');

	return (
		<ReportsLayout>
			<DashboardShell>
				<DashboardFilters
					title={isWeekly ? 'Reporte semanal' : 'Reporte anual'}
					subtitle="Recaudo, gastos y utilidad (recaudo − gastos)"
					icon={<CalendarOutlined />}
					filters={filters}
					badge={rangeLabel}
					extra={
						<DatePicker
							aria-label={isWeekly ? 'Seleccionar semana' : 'Seleccionar año'}
							picker={isWeekly ? 'week' : 'year'}
							value={period}
							allowClear={false}
							onChange={value => setPicked(value)}
							style={{ height: 44, borderRadius: 12, minWidth: 150 }}
						/>
					}
				/>
				{currencies.length === 0 ? (
					<PeriodBlock mode={mode} picked={picked} params={filters.params} />
				) : (
					<CurrencyBlocks currencies={currencies}>
						{code => <PeriodBlock mode={mode} picked={picked} params={{ ...filters.params, currency: code }} />}
					</CurrencyBlocks>
				)}
			</DashboardShell>
		</ReportsLayout>
	);
};

export default PeriodReport;
