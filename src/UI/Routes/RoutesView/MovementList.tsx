import { FC } from 'react';

import { Empty, Flex, Pagination, Skeleton, Typography } from 'antd';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import { RouteMovement } from '@/domain/RouteMovement';

import { IconBox } from '@/UI/Components/Dashboard/ui';
import { useMoney } from '@/infrastructure/hooks/useMoney';


const { Text } = Typography;

interface MovementListProps {
	movements: RouteMovement[];
	total: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number, pageSize: number) => void;
	isLoading?: boolean;
	isMobile?: boolean;
}

function MovementRow({ movement }: { movement: RouteMovement }) {
	const money = useMoney();
	const isIncome = movement.type === 'INGRESO';
	return (
		<Flex
			align="center"
			gap={10}
			style={{ padding: '10px 2px', borderBottom: '1px solid var(--kb-border)' }}
		>
			<IconBox
				icon={isIncome ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
				tone={isIncome ? 'ok' : 'danger'}
			/>
			<div style={{ minWidth: 0, flex: 1 }}>
				<Text
					ellipsis
					style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13, fontWeight: 500 }}
				>
					{movement.concept}
				</Text>
				<Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
					{dayjs(movement.createdAt).format('DD/MM/YYYY HH:mm')} · {movement.userName || 'Sin usuario'}
				</Text>
			</div>
			<Text
				strong
				className="kb-mono"
				style={{ color: isIncome ? 'var(--kb-ok)' : 'var(--kb-danger)', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}
			>
				{isIncome ? '+' : '−'}{money(movement.value)}
			</Text>
		</Flex>
	);
}

export const MovementList: FC<MovementListProps> = ({ movements, total, page, pageSize, onPageChange, isLoading, isMobile }) => {
	if (isLoading) {
		return (
			<Flex vertical gap={8} style={{ padding: '8px 2px' }}>
				{Array.from({ length: 4 }).map((_, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
				))}
			</Flex>
		);
	}

	if (movements.length === 0) {
		return <Empty style={{ margin: '32px 0' }} description="Aún no hay movimientos en esta ruta" />;
	}

	return (
		<Flex vertical>
			<div>
				{movements.map((movement, index) => (
					<MovementRow key={movement.id ?? index} movement={movement} />
				))}
			</div>
			{total > pageSize && (
				<Flex justify="center" style={{ marginTop: 12 }}>
					<Pagination
						current={page}
						pageSize={pageSize}
						total={total}
						onChange={onPageChange}
						showSizeChanger={false}
						simple={isMobile}
						size="small"
					/>
				</Flex>
			)}
		</Flex>
	);
};

export default MovementList;
