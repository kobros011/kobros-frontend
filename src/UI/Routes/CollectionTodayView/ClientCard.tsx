import { Button, Card, InputNumber, Modal, Space, Tag, Typography, notification } from 'antd';
import { FC, useState } from 'react';
import { Collection } from '@/domain/Collection';
import { usePayCollection } from '@/infrastructure/querys/Collection';
import { PaymentStatus } from '@/constants/types';

const { Text, Title } = Typography;

interface ClientCardProps {
	collection: Collection;
}

const formatMoney = (val: number) =>
	new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const statusColor: Record<string, string> = {
	[PaymentStatus.paid]: 'green',
	[PaymentStatus.pending]: 'orange',
	[PaymentStatus.default]: 'red',
};

const statusLabel: Record<string, string> = {
	[PaymentStatus.paid]: 'Pagado',
	[PaymentStatus.pending]: 'Pendiente',
	[PaymentStatus.default]: 'Mora',
};

export const ClientCard: FC<ClientCardProps> = ({ collection }) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [amount, setAmount] = useState<number | null>(collection.value);
	const { mutate: payCollection, isPending } = usePayCollection();

	const isPaid = collection.status === PaymentStatus.paid;

	const handlePay = () => {
		if (!amount || amount <= 0) return;
		payCollection(
			{ paymentId: collection.id, value: amount },
			{
				onSuccess: () => {
					notification.success({ message: 'Cobro registrado exitosamente' });
					setModalOpen(false);
				},
				onError: () => {
					notification.error({ message: 'Error al registrar el cobro' });
				},
			},
		);
	};

	return (
		<>
			<Card
				style={{
					marginBottom: 12,
					opacity: isPaid ? 0.6 : 1,
					borderLeft: `4px solid ${isPaid ? '#52c41a' : collection.status === PaymentStatus.default ? '#ff4d4f' : '#faad14'}`,
				}}
				bodyStyle={{ padding: '12px 16px' }}
			>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
							<Text strong style={{ fontSize: 15 }}>
								{collection.order}. {collection.clientFullName}
							</Text>
							<Tag color={statusColor[collection.status] ?? 'default'}>
								{statusLabel[collection.status] ?? collection.status}
							</Tag>
						</div>
						<Text type="secondary" style={{ fontSize: 12 }}>
							CC {collection.idDocument}
						</Text>
						{collection.clientAddress && (
							<div>
								<Text type="secondary" style={{ fontSize: 12 }}>
									📍 {collection.clientAddress}
								</Text>
							</div>
						)}
						{collection.clientMobile && (
							<div>
								<Text type="secondary" style={{ fontSize: 12 }}>
									📞 {collection.clientMobile}
								</Text>
							</div>
						)}
						<div style={{ marginTop: 6 }}>
							<Space size={16}>
								<div>
									<Text type="secondary" style={{ fontSize: 11 }}>Cuota</Text>
									<div>
										<Text strong style={{ color: '#1677ff' }}>{formatMoney(collection.value)}</Text>
									</div>
								</div>
								{(collection.totalDefault ?? 0) > 0 && (
									<div>
										<Text type="secondary" style={{ fontSize: 11 }}>Mora acum.</Text>
										<div>
											<Text strong style={{ color: '#ff4d4f' }}>{formatMoney(collection.totalDefault)}</Text>
										</div>
									</div>
								)}
								<div>
									<Text type="secondary" style={{ fontSize: 11 }}>Cuota #{collection.quotaNumber}</Text>
									<div>
										<Text>{collection.canceledQuotas}/{collection.agreedQuotas}</Text>
									</div>
								</div>
							</Space>
						</div>
					</div>

					{!isPaid && (
						<Button
							type="primary"
							size="middle"
							onClick={() => setModalOpen(true)}
							style={{ minWidth: 64, fontWeight: 600, marginLeft: 12 }}
						>
							COBRAR
						</Button>
					)}
				</div>
			</Card>

			<Modal
				title="Registrar cobro"
				centered
				open={modalOpen}
				onCancel={() => setModalOpen(false)}
				onOk={handlePay}
				okText="CONFIRMAR COBRO"
				cancelText="Cancelar"
				confirmLoading={isPending}
				okButtonProps={{ disabled: !amount || amount <= 0, style: { fontWeight: 600 } }}
			>
				<div style={{ marginBottom: 8 }}>
					<Text type="secondary">Cliente: {collection.clientFullName}</Text>
					<div>
						<Text type="secondary">Cuota: {formatMoney(collection.value)}</Text>
					</div>
					{(collection.totalDefault ?? 0) > 0 && (
						<div>
							<Text type="secondary">Mora acumulada: {formatMoney(collection.totalDefault)}</Text>
						</div>
					)}
				</div>

				<Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Monto a cobrar</Title>
				<InputNumber
					value={amount}
					onChange={(val) => setAmount(val)}
					style={{ width: '100%', height: 56, fontSize: 20 }}
					inputMode="numeric"
					min={1}
					formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
					parser={(val) => Number(val?.replace(/\$\s?|(,*)/g, '') ?? 0) as unknown as 0}
					size="large"
				/>
			</Modal>
		</>
	);
};
