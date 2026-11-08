import { FC, useEffect, useState } from 'react';
import { App, Button, Card, Space, Tag, theme, Typography } from 'antd';
import {
	DownOutlined,
	EnvironmentOutlined,
	PhoneOutlined,
	RightOutlined,
	WalletOutlined,
} from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { Collection } from '@/domain/Collection';
import { queryKeyCollection } from '@/constants/queryKeys';
import { repository as paymentRepository } from '@/infrastructure/repositories/Payment';
import { handleError } from '@/infrastructure/utils/handleError';
import {
	computeGroupBalance,
	formatMoneyCOP,
	getGroupFooterText,
	getGroupHeaderBadges,
	getQuotaFixed,
	isPaid,
} from './groupCollections';
import { QuotaCard } from './QuotaCard';
import './collectionToday.css';

const { Text } = Typography;

interface ClientGroupCardProps {
	items: Collection[];
	selectedDate: Dayjs;
}

export const ClientGroupCard: FC<ClientGroupCardProps> = ({ items, selectedDate }) => {
	const { token } = theme.useToken();
	const { notification, modal } = App.useApp();
	const queryClient = useQueryClient();
	const [payAllLoading, setPayAllLoading] = useState(false);

	const first = items[0];
	const order = Math.min(...items.map(i => i.order));
	const badges = getGroupHeaderBadges(items);
	const groupBalance = computeGroupBalance(items);
	const unpaidOpen = items.filter(i => !isPaid(i));
	const hasPending = unpaidOpen.length > 0;
	const [expanded, setExpanded] = useState(hasPending);

	useEffect(() => {
		setExpanded(hasPending);
	}, [hasPending]);

	const payAllDisabled = groupBalance <= 0 || payAllLoading;

	const toggleExpanded = () => setExpanded((open) => !open);

	const runPayAll = async () => {
		const toPay = [...unpaidOpen].sort(
			(a, b) => dayjs(a.payDate).valueOf() - dayjs(b.payDate).valueOf(),
		);
		setPayAllLoading(true);
		let paidCount = 0;
		try {
			for (const quota of toPay) {
				const value = getQuotaFixed(quota);
				await paymentRepository.payPayment(quota.id, value);
				paidCount += 1;
			}
			await queryClient.invalidateQueries({ queryKey: [queryKeyCollection.base] });
			notification.success({
				message: 'Cobro total registrado',
				description: `${paidCount} cuota(s) aplicadas`,
			});
		} catch (error) {
			await queryClient.invalidateQueries({ queryKey: [queryKeyCollection.base] });
			const msg = handleError(error, 'Error al registrar el cobro');
			notification.error({
				message: paidCount > 0 ? 'Cobro parcial registrado' : 'Error al registrar el cobro',
				description:
					paidCount > 0
						? `${paidCount} cuota(s) aplicadas antes del error. ${msg}`
						: msg,
			});
		} finally {
			setPayAllLoading(false);
		}
	};

	const confirmPayAll = () => {
		modal.confirm({
			title: 'Confirmar cobro total',
			content: `Se aplicará el saldo completo (${formatMoneyCOP(groupBalance)}) en ${unpaidOpen.length} cuota(s).`,
			okText: 'Confirmar',
			cancelText: 'Cancelar',
			centered: true,
			width: 320,
			className: 'collection-today-confirm-modal',
			okButtonProps: { size: 'small' },
			cancelButtonProps: { size: 'small' },
			onOk: () => runPayAll(),
		});
	};

	return (
		<Card
			size="small"
			className={`collection-today-client-card${expanded ? '' : ' collection-today-client-card-collapsed'}`}
			style={{ borderColor: token.colorBorder }}
		>
			<button
				type="button"
				className="collection-today-client-header collection-today-client-toggle"
				onClick={toggleExpanded}
				aria-expanded={expanded}
				aria-label={expanded ? 'Ocultar detalle del cliente' : 'Ver detalle del cliente'}
			>
				<span className="collection-today-client-toggle-icon" aria-hidden>
					{expanded ? <DownOutlined /> : <RightOutlined />}
				</span>
				<Text strong className="collection-today-client-name" ellipsis>
					{order}. {first.clientFullName}
				</Text>
				{first.clientBeak > 0 && (
					<Tag color="success" className="collection-today-tag" aria-label="Saldo a favor del cliente">
						A favor {formatMoneyCOP(first.clientBeak)}
					</Tag>
				)}
				{(expanded || hasPending) && (
				<Space size={2} wrap className="collection-today-client-header-badges">
					{badges.pendingCount > 0 && (
						<Tag color="warning" className="collection-today-tag">{badges.pendingCount} pend.</Tag>
					)}
					{badges.moraCount > 0 && (
						<Tag color="error" className="collection-today-tag">{badges.moraCount} mora</Tag>
					)}
					{badges.paidCount > 0 && expanded && (
						<Tag color="success" className="collection-today-tag">{badges.paidCount} pag.</Tag>
					)}
				</Space>
				)}
			</button>

			{expanded && (
			<div className="collection-today-client-body">
			<div className="collection-today-client-meta">
				<span>
					<Text type="secondary">CC {first.idDocument}</Text>
				</span>
				{first.clientBeak > 0 && (
					<span className="meta-full">
						<WalletOutlined aria-hidden />
						<Text type="success" strong>Saldo a favor: {formatMoneyCOP(first.clientBeak)}</Text>
					</span>
				)}

				{first.clientMobile && (
					<span style={{ justifyContent: 'flex-end' }}>
						<PhoneOutlined aria-label="Teléfono" />
						<a href={`tel:${first.clientMobile.replace(/\s/g, '')}`}>
							{first.clientMobile}
						</a>
					</span>
				)}
				{first.clientAddress && (
					<span className="meta-full">
						<EnvironmentOutlined aria-label="Dirección" />
						<Text type="secondary" ellipsis>{first.clientAddress}</Text>
					</span>
				)}
			</div>

			{unpaidOpen.length > 0 && (
				<Button
					type="primary"
					size="small"
					icon={<WalletOutlined />}
					block
					className="collection-today-pay-all"
					loading={payAllLoading}
					disabled={payAllDisabled}
					onClick={confirmPayAll}
				>
					Todo · {formatMoneyCOP(groupBalance)}
				</Button>
			)}

			<div className="collection-today-quotas-grid">
				{items.map(item => (
					<QuotaCard
						key={item.id}
						item={item}
						selectedDate={selectedDate}
					/>
				))}
			</div>

			<Text type="secondary" className="collection-today-footer">
				{getGroupFooterText(items)}
			</Text>
			</div>
			)}
		</Card>
	);
};
