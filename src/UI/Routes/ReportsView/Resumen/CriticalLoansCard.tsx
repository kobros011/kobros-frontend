import { FC, useEffect, useState } from 'react';
import { Button, Empty, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { DashCard, Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { formatCOP, getInitials } from '@/UI/Components/Dashboard/format';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { getDashboardCritical } from '@/infrastructure/querys/Report';
import { useDebouncedValue } from '@/infrastructure/hooks/useDebouncedValue';
import { CriticalLoanDto, DashboardParams } from '@/infrastructure/dto/DashboardDto';

const PAGE_SIZE = 5;

interface CriticalLoansCardProps {
	params: DashboardParams;
	criticalDays: number;
	/** Clientes distintos con mora crítica (viene del resumen, no depende de la búsqueda). */
	criticalClients: number;
}

/** Top de créditos en mora con búsqueda y paginación del servidor (5 por página). */
export const CriticalLoansCard: FC<CriticalLoansCardProps> = ({ params, criticalDays, criticalClients }) => {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const text = useDebouncedValue(search.trim(), 300);

	const { page: result, isLoading } = getDashboardCritical({ ...params, text: text || undefined }, { page, pageSize: PAGE_SIZE });
	const rows = result?.items ?? [];
	const total = result?.total ?? 0;
	const pageCount = Math.max(1, result?.pages ?? 1);

	// Al cambiar ruta, recaudador o búsqueda se vuelve a la primera página.
	useEffect(() => setPage(1), [params.route_id, params.collector_id, text]);
	// Si la página actual deja de existir (p. ej. tras un pago), se retrocede a la última válida.
	useEffect(() => {
		if (result && page > pageCount) setPage(pageCount);
	}, [result, page, pageCount]);

	const isCritical = (record: CriticalLoanDto) => record.severity === 'critical';

	const columns: ColumnsType<CriticalLoanDto> = [
		{
			title: 'Cliente / Titular',
			key: 'client',
			render: (_, record) => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<span className={`kb-avatar kb-tone-${isCritical(record) ? 'danger' : 'warn'}`}>{getInitials(record.client_name)}</span>
					<strong>{record.client_name}</strong>
				</div>
			),
		},
		{
			title: 'Documento (CC)',
			key: 'doc',
			render: (_, record) => <span className="kb-mono" style={{ color: 'var(--kb-muted)', fontSize: 12 }}>{record.client_document ?? '—'}</span>,
		},
		{ title: 'Ruta asignada', dataIndex: 'route_name', key: 'route' },
		{
			title: 'Recaudador',
			key: 'collector',
			render: (_, record) => <span style={{ color: 'var(--kb-muted)' }}>{record.collector_names.map(shortName).join(', ') || '—'}</span>,
		},
		{
			title: 'Saldo vencido',
			dataIndex: 'overdue_amount',
			key: 'balance',
			align: 'right',
			render: (value: number, record) => (
				<strong className="kb-mono" style={{ color: isCritical(record) ? 'var(--kb-danger)' : 'var(--kb-warn)' }}>{formatCOP(value)}</strong>
			),
		},
		{
			title: 'Días de atraso',
			dataIndex: 'days_overdue',
			key: 'days',
			align: 'center',
			render: (value: number, record) => (
				<span className="kb-mono" style={{ color: isCritical(record) ? 'var(--kb-danger)' : 'var(--kb-warn)' }}>{value} días</span>
			),
		},
		{
			title: 'Severidad',
			key: 'severity',
			align: 'center',
			render: (_, record) => isCritical(record)
				? <Pill tone="danger">Crítica (&gt;{criticalDays}d)</Pill>
				: <Pill tone="warn">Alerta (&lt;{criticalDays}d)</Pill>,
		},
		{
			title: 'Acción rápida',
			key: 'actions',
			align: 'right',
			render: (_, record) => (
				<Button type="primary" style={{ minHeight: 36 }} onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${record.loan_id}`)}>
					Gestionar
				</Button>
			),
		},
	];

	return (
		<SectionCard
			icon={<ExclamationCircleOutlined />}
			tone="danger"
			title="Créditos en mora crítica (top casos prioritarios)"
			subtitle={`Clientes con atraso superior a ${criticalDays} días, para gestión de cobranza`}
			extra={
				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
					<Pill tone="danger">{criticalClients} {criticalClients === 1 ? 'cliente' : 'clientes'} en alerta</Pill>
					<Input
						allowClear
						aria-label="Buscar cliente en mora"
						prefix={<SearchOutlined />}
						placeholder="Buscar cliente en mora..."
						value={search}
						onChange={event => setSearch(event.target.value)}
						style={{ width: 220 }}
					/>
				</div>
			}
			footer={
				<>
					<span>Mostrando {rows.length} de {total} créditos en mora</span>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
						<span>Página {Math.min(page, pageCount)} de {pageCount}</span>
						<Button size="small" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Siguiente</Button>
					</div>
				</>
			}
		>
			<DashCard className="kb-table" style={{ padding: 0, border: 'none', background: 'transparent' }}>
				<Table
					columns={columns}
					dataSource={rows}
					rowKey="loan_id"
					loading={isLoading}
					pagination={false}
					scroll={{ x: 900 }}
					locale={{ emptyText: <Empty description="No hay créditos en mora" /> }}
				/>
			</DashCard>
		</SectionCard>
	);
};
