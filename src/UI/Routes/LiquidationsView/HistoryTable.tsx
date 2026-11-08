import { FC } from 'react';
import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { Pill } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';
import { LiquidationListItemDto, LiquidationTotalsDto } from '@/infrastructure/dto/LiquidationDto';
import { formatDay, getDifferenceView, getStatusView, signedCOP } from './statusMeta';

interface HistoryTableProps {
	items: LiquidationListItemDto[];
	summary: LiquidationTotalsDto;
	loading: boolean;
	total: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number, pageSize: number) => void;
	onOpen: (id: string) => void;
}

const money = (value: number, color?: string) => <span className="kb-mono" style={color ? { color } : undefined}>{formatCOP(value)}</span>;

/** Tabla de cierres con la fila "Totales período filtrado" (de todo el filtro, no solo de la página). */
export const HistoryTable: FC<HistoryTableProps> = ({ items, summary, loading, total, page, pageSize, onPageChange, onOpen }) => {
	const columns: ColumnsType<LiquidationListItemDto> = [
		{
			title: 'Fecha', key: 'date', width: 120,
			render: (_, item) => <span className="kb-mono">{item.status === 'confirmada' && <span className="lq-dot" aria-hidden />}{formatDay(item.date)}</span>,
		},
		{ title: 'Ruta', dataIndex: 'route_name', key: 'route' },
		{ title: 'Cobrador', key: 'collector', render: (_, item) => (item.collector_name ? shortName(item.collector_name) : 'Consolidado') },
		{ title: 'Recaudo', key: 'collected', align: 'right', render: (_, item) => money(item.total_value_charged) },
		{ title: 'Gastos', key: 'expenses', align: 'right', render: (_, item) => money(-item.total_value_expenses, 'var(--kb-warn)') },
		{ title: 'Créditos nuevos', key: 'loans', align: 'right', render: (_, item) => <span className="kb-mono" style={{ color: 'var(--kb-info)' }}>{signedCOP(-item.value_new_loans)} ({item.new_loans_count})</span> },
		{ title: 'Esperado', key: 'expected', align: 'right', render: (_, item) => money(item.expected_cash ?? 0) },
		{ title: 'Entregado', key: 'delivered', align: 'right', render: (_, item) => money(item.cash_delivered ?? 0) },
		{
			title: 'Diferencia', key: 'difference', align: 'center',
			render: (_, item) => { const view = getDifferenceView(item.difference ?? 0); return <Pill tone={view.tone}>{view.icon} {view.text}</Pill>; },
		},
		{
			title: 'Estado', key: 'status', align: 'center',
			render: (_, item) => { const view = getStatusView(item.status, item.outdated); return <Pill tone={view.tone}>{view.icon} {view.label}</Pill>; },
		},
		{ title: '', key: 'open', align: 'right', render: (_, item) => <Button size="small" onClick={() => onOpen(item.id)}>Ver detalle</Button> },
	];

	return (
		<div className="kb-table">
			<Table<LiquidationListItemDto>
				size="small" rowKey="id" columns={columns} dataSource={items} loading={loading} scroll={{ x: 1100 }}
				onRow={item => ({ onClick: () => onOpen(item.id), style: { cursor: 'pointer' } })}
				pagination={{
					current: page, pageSize, total, size: 'small', showSizeChanger: true, pageSizeOptions: PAGE_SIZE_OPTIONS, onChange: onPageChange,
					showTotal: (all, [from, to]) => `Mostrando ${from}-${to} de ${all} cierres`,
				}}
				summary={() => (
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={3}><strong>Totales período filtrado ({summary.count} cierres)</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={3} align="right"><strong>{money(summary.collected)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={4} align="right"><strong>{money(-summary.expenses, 'var(--kb-warn)')}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={5} align="right"><strong className="kb-mono" style={{ color: 'var(--kb-info)' }}>{signedCOP(-summary.new_loans)} ({summary.new_loans_count})</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={6} align="right"><strong>{money(summary.expected)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={7} align="right"><strong>{money(summary.delivered)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={8} align="center"><strong>{money(summary.difference)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={9} colSpan={2} />
					</Table.Summary.Row>
				)}
			/>
		</div>
	);
};
