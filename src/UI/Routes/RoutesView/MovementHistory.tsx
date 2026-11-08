import { FC } from 'react';

import { Button, Empty, Flex, Table } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { ArrowDownOutlined, ArrowUpOutlined, HistoryOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import { RouteMovement, RouteMovementType } from '@/domain/RouteMovement';

import { ViewMode } from '@/infrastructure/context/TableViewStore';

import { IconBox, Pill } from '@/UI/Components/Dashboard/ui';

import ViewSwitcher from '@/UI/Components/Table/ViewSwitcher';
import MovementList from './MovementList';
import { useMoney } from '@/infrastructure/hooks/useMoney';

interface MovementHistoryProps {
	movements: RouteMovement[];
	total: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number, pageSize: number) => void;
	isLoading?: boolean;
	isMobile: boolean;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	onIngresar: () => void;
	onRetirar: () => void;
	readonly?: boolean;
}

const MovementHistory: FC<MovementHistoryProps> = ({
	movements, total, page, pageSize, onPageChange, isLoading, isMobile, viewMode, onViewModeChange, onIngresar, onRetirar, readonly = false,
}) => {
	const money = useMoney();
	const columns: ColumnsType<RouteMovement> = [
		{
			title: 'Fecha',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			render: (value: string) => <span className="kb-mono" style={{ fontSize: 12 }}>{dayjs(value).format('DD/MM/YYYY HH:mm')}</span>,
		},
		{
			title: 'Tipo',
			dataIndex: 'type',
			key: 'type',
			align: 'center',
			render: (value: RouteMovementType) => value === 'INGRESO'
				? <Pill tone="ok"><ArrowUpOutlined /> Ingreso</Pill>
				: <Pill tone="danger"><ArrowDownOutlined /> Retiro</Pill>,
		},
		{
			title: 'Monto',
			dataIndex: 'value',
			key: 'value',
			align: 'center',
			render: (value: number, record) => (
				<strong className="kb-mono" style={{ color: record.type === 'INGRESO' ? 'var(--kb-ok)' : 'var(--kb-danger)' }}>
					{record.type === 'INGRESO' ? '+' : '−'}{money(value)}
				</strong>
			),
		},
		{ title: 'Motivo', dataIndex: 'concept', key: 'concept', align: 'center' },
		{ title: 'Registrado por', dataIndex: 'userName', key: 'userName', align: 'center' },
	];

	const buttonSize = isMobile ? 'small' : 'middle';

	return (
		<div className="kb-card">
			<Flex justify="space-between" align="flex-start" gap={12} wrap="wrap" style={{ marginBottom: 14 }}>
				<Flex gap={10} align="center" style={{ minWidth: 0 }}>
					<IconBox icon={<HistoryOutlined />} />
					<div style={{ minWidth: 0 }}>
						<h3 className="kb-section-title">Historial de movimientos</h3>
						<div className="kb-section-sub">Del más reciente al más antiguo</div>
					</div>
				</Flex>
				<ViewSwitcher value={viewMode} onChange={onViewModeChange} size={isMobile ? 'small' : 'middle'} />
			</Flex>

			{!readonly && (
				<Flex gap={8} wrap="wrap" style={{ marginBottom: 14 }}>
					<Button type="primary" size={buttonSize} icon={<ArrowUpOutlined />} onClick={onIngresar} style={isMobile ? { flex: 1 } : undefined}>
						Ingresar dinero
					</Button>
					<Button danger size={buttonSize} icon={<ArrowDownOutlined />} onClick={onRetirar} style={isMobile ? { flex: 1 } : undefined}>
						Retirar dinero
					</Button>
				</Flex>
			)}

			{viewMode === 'list' ? (
				<MovementList
					movements={movements}
					total={total}
					page={page}
					pageSize={pageSize}
					onPageChange={onPageChange}
					isLoading={isLoading}
					isMobile={isMobile}
				/>
			) : (
				<div className="kb-table">
					<Table
						columns={columns}
						dataSource={movements}
						rowKey="id"
						loading={isLoading}
						size="small"
						scroll={{ x: 700 }}
						pagination={{
							current: page,
							pageSize,
							total,
							onChange: onPageChange,
							showSizeChanger: !isMobile,
							pageSizeOptions: [10, 20, 50],
							simple: isMobile,
							size: 'small',
						}}
						locale={{ emptyText: <Empty description="Aún no hay movimientos en esta ruta" /> }}
					/>
				</div>
			)}
		</div>
	);
};

export default MovementHistory;
