import { Button, Card, Col, Row, Tag, Typography, notification } from 'antd';
import { FC } from 'react';
import { Liquidation } from '@/domain/Liquidation';
import { useConfirmLiquidation } from '@/infrastructure/querys/Liquidation';
import { AxiosError } from 'axios';

const { Title, Text } = Typography;

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

interface PendingConfirmationsProps {
	liquidations: Liquidation[];
}

export const PendingConfirmations: FC<PendingConfirmationsProps> = ({ liquidations }) => {
	const { mutate: confirmLiquidation, isPending } = useConfirmLiquidation();

	const handleConfirm = (id: string) => {
		confirmLiquidation(id, {
			onSuccess: () => {
				notification.success({ message: 'Liquidación confirmada exitosamente' });
			},
			onError: (err: unknown) => {
				const detail = err instanceof AxiosError
					? (err.response?.data as { detail?: string } | undefined)?.detail
					: undefined;
				notification.error({ message: detail ?? 'Error al confirmar' });
			},
		});
	};

	return (
		<div style={{ marginTop: 24 }}>
			<Title level={5} style={{ marginBottom: 12 }}>Liquidaciones pendientes de confirmación</Title>
			{liquidations.map((liq) => (
				<Card
					key={liq.id}
					style={{ marginBottom: 12, borderLeft: '4px solid #faad14' }}
					bodyStyle={{ padding: '12px 16px' }}
				>
					<Row align="middle" justify="space-between" gutter={[8, 8]}>
						<Col flex={1}>
							<div style={{ marginBottom: 4 }}>
								<Text strong>{liq.date?.slice(0, 10)}</Text>
								<Tag color="orange" style={{ marginLeft: 8 }}>Pendiente</Tag>
							</div>
							<Row gutter={[16, 4]}>
								<Col xs={12}><Text type="secondary" style={{ fontSize: 12 }}>Cobrado: </Text><Text style={{ fontSize: 12 }}>{formatMoney(liq.totalValueCharged)}</Text></Col>
								<Col xs={12}><Text type="secondary" style={{ fontSize: 12 }}>Gastos: </Text><Text style={{ fontSize: 12 }}>{formatMoney(liq.totalValueExpenses)}</Text></Col>
								<Col xs={12}><Text type="secondary" style={{ fontSize: 12 }}>Meta: </Text><Text style={{ fontSize: 12 }}>{formatMoney(liq.todayCollectionGoal)}</Text></Col>
								<Col xs={12}><Text type="secondary" style={{ fontSize: 12 }}>Base: </Text><Text style={{ fontSize: 12 }}>{formatMoney(liq.valueBaseDelivered)}</Text></Col>
							</Row>
						</Col>
						<Col>
							<Button
								type="primary"
								size="large"
								loading={isPending}
								onClick={() => handleConfirm(liq.id)}
								style={{ minHeight: 48, fontWeight: 600 }}
							>
								CONFIRMAR
							</Button>
						</Col>
					</Row>
				</Card>
			))}
		</div>
	);
};
