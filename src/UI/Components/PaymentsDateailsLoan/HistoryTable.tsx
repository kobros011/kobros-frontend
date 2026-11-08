import { FC } from 'react';

import { Table } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { Pill } from '@/UI/Components/Dashboard/ui';

import { PaymentHistoryItemDto, PaymentHistorySummaryDto } from '@/infrastructure/dto/PaymentHistoryDto';

import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';

import { QuotaPayInline } from './QuotaPayInline';

import { formatDate, getDelayText, getStatusView } from './statusMeta';
import { useMoney } from '@/infrastructure/hooks/useMoney';


interface HistoryTableProps {
	items: PaymentHistoryItemDto[];
	summary: PaymentHistorySummaryDto;
	loading: boolean;
	total: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number, pageSize: number) => void;
}

/** Tabla de cuotas con fila de totales del plan completo (no solo de la página). */
export const HistoryTable: FC<HistoryTableProps> = ({ items, summary, loading, total, page, pageSize, onPageChange }) => {
	const money = useMoney();
	const moneyCell = (value: number) => <span className="kb-mono">{money(value)}</span>;
	const columns: ColumnsType<PaymentHistoryItemDto> = [
		{ title: '#', dataIndex: 'quota_number', key: 'quota', width: 56 },
		{
			title: 'Fecha límite',
			key: 'pay_date',
			render: (_, item) => {
				const delay = getDelayText(item);
				return (
					<div>
						<span className="kb-mono">{formatDate(item.pay_date)}</span>
						{delay && <div style={{ fontSize: 11, color: item.status === 'mora' ? 'var(--kb-danger)' : 'var(--kb-warn)' }}>{delay}</div>}
					</div>
				);
			},
		},
		{ title: 'Valor cuota', dataIndex: 'value', key: 'value', align: 'right', render: moneyCell },
		{
			title: 'Pagado',
			key: 'applied',
			align: 'right',
			render: (_, item) => (
				<span className="kb-mono" style={{ color: item.applied > 0 ? 'var(--kb-ok)' : undefined }}>
					{money(item.applied)}
					{item.excess > 0 && <div style={{ fontSize: 11 }}>+{money(item.excess)} a favor</div>}
				</span>
			),
		},
		{ title: 'Saldo', dataIndex: 'balance', key: 'balance', align: 'right', render: (value: number) => <span className="kb-mono" style={{ color: value > 0 ? 'var(--kb-warn)' : undefined }}>{money(value)}</span> },
		{
			title: 'Estado',
			key: 'status',
			align: 'center',
			render: (_, item) => {
				const view = getStatusView(item);
				return <Pill tone={view.tone}>{view.icon} {view.label}</Pill>;
			},
		},
		{ title: 'Fecha de pago', key: 'payment_date', render: (_, item) => <span className="kb-mono">{formatDate(item.payment_date)}</span> },
		{ title: 'Recaudó', dataIndex: 'collected_by_name', key: 'collector', render: (value: string | null) => value ?? '—' },
		{ title: 'Acción', key: 'action', align: 'right', width: 260, render: (_, item) => <QuotaPayInline item={item} compact /> },
	];

	return (
		<div className="kb-table">
			<Table<PaymentHistoryItemDto>
				size="small"
				rowKey="id"
				columns={columns}
				dataSource={items}
				loading={loading}
				scroll={{ x: 1000 }}
				pagination={{
					current: page,
					pageSize,
					total,
					size: 'small',
					showSizeChanger: true,
					pageSizeOptions: PAGE_SIZE_OPTIONS,
					showTotal: (all, [from, to]) => `Mostrando ${from}-${to} de ${all} cuotas`,
					onChange: onPageChange,
				}}
				summary={() => (
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={2}><strong>Totales (plan de {summary.total_quotas} cuotas)</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={2} align="right"><strong>{money(summary.total_due)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={3} align="right"><strong>{money(summary.total_paid)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={4} align="right"><strong>{money(summary.total_balance)}</strong></Table.Summary.Cell>
						<Table.Summary.Cell index={5} colSpan={4} />
					</Table.Summary.Row>
				)}
			/>
		</div>
	);
};
