import { FC, useState } from 'react';
import { Alert, Empty, Pagination, Skeleton } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { SectionCard } from '@/UI/Components/Dashboard/ui';
import { getLiquidationPage } from '@/infrastructure/querys/Liquidation';
import { PendingCard } from './PendingCard';
import { LiquidationDrawer } from './LiquidationDrawer';

const PAGE_SIZE = 6;

/** Cierres pendientes por confirmar (solo admin), del más antiguo al más reciente. */
export const PendingTab: FC = () => {
	const [page, setPage] = useState(1);
	const [openId, setOpenId] = useState<string>();
	const { page: result, isLoading, isError, refetch } = getLiquidationPage({ status: 'pendiente' }, { page, pageSize: PAGE_SIZE });
	const total = result?.total ?? 0;

	return (
		<>
			<SectionCard
				icon={<CheckCircleOutlined />}
				tone="warn"
				title="Cierres pendientes por confirmar"
				subtitle="Aprobación final de efectivo antes de consolidar el arqueo en caja general"
				extra={<span className="kb-section-sub">Orden: más antiguo primero · {total} {total === 1 ? 'pendiente' : 'pendientes'}</span>}
			>
				{isError && <Alert type="error" showIcon message="No se pudieron cargar los cierres" action={<a onClick={() => void refetch()}>Reintentar</a>} />}
				{isLoading && !result && <Skeleton active paragraph={{ rows: 5 }} />}
				{result && result.items.length === 0 && <Empty description="No hay cierres por confirmar" />}
				{result && result.items.length > 0 && (
					<>
						<div className="lq-cards lq-cards-wide">
							{result.items.map(item => <PendingCard key={item.id} item={item} onOpen={setOpenId} />)}
						</div>
						{total > PAGE_SIZE && (
							<div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
								<Pagination size="small" current={page} pageSize={PAGE_SIZE} total={total} showSizeChanger={false} onChange={setPage} />
							</div>
						)}
					</>
				)}
			</SectionCard>
			<LiquidationDrawer id={openId} isAdmin onClose={() => setOpenId(undefined)} />
		</>
	);
};
