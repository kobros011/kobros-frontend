import { CSSProperties, FC, useState } from 'react';

import { App, Button, Card, InputNumber, Progress, Space, Tag, theme, Typography } from 'antd';

import { CheckCircleOutlined, LinkOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import dayjs, { Dayjs } from 'dayjs';
import { Collection } from '@/domain/Collection';

import { PaymentStatus } from '@/constants/types';

import routePaths from '@/constants/routePaths';
import { usePayCollection } from '@/infrastructure/querys/Collection';

import { handleError } from '@/infrastructure/utils/handleError';

import { getOverdueDays, getQuotaFixed, getRemainingAmount, isPaid, isPartial } from './groupCollections';
import './collectionToday.css';
import { useMoney } from '@/infrastructure/hooks/useMoney';

const { Text } = Typography;

interface QuotaCardProps {
	item: Collection;
	selectedDate: Dayjs;
}

export const QuotaCard: FC<QuotaCardProps> = ({ item, selectedDate }) => {
	const money = useMoney();
	const { token } = theme.useToken();
	const { notification } = App.useApp();
	const navigate = useNavigate();
	const { mutate: payCollection, isPending } = usePayCollection();
	const [amount, setAmount] = useState<number | null>(null);

	const paid = isPaid(item);
	const remaining = getRemainingAmount(item);
	const fixed = getQuotaFixed(item);
	const applied = item.applied ?? 0;
	// Pagó más que la cuota: se muestra Base (cuota), Abono (lo de más) y Total (lo recibido).
	const extra = Math.max(applied - fixed, 0);
	const overdueDays = getOverdueDays(item, selectedDate);
	const partial = isPartial(item);

	const borderColor = (() => {
		if (paid) return token.colorSuccess;
		if (item.status === PaymentStatus.default) return token.colorError;
		if (partial) return token.colorPrimary;
		return token.colorWarning;
	})();

	const cardStyle: CSSProperties = {
		opacity: paid ? 0.5 : 1,
		borderColor,
		background:
			item.status === PaymentStatus.default && !paid
				? `${token.colorError}10`
				: token.colorBgContainer,
	};

	const statusTag = (() => {
		const tagClass = 'collection-today-tag';
		if (paid) return <Tag color="success" className={tagClass}>PAGADO</Tag>;
		if (item.status === PaymentStatus.default) {
			const label = overdueDays > 0 ? `MORA · ${overdueDays}D` : 'MORA';
			return <Tag color="error" className={tagClass}>{label}</Tag>;
		}
		if (partial) {
			const pct = fixed > 0 ? Math.round((applied / fixed) * 100) : 0;
			return <Tag color="processing" className={tagClass}>PARCIAL {pct}%</Tag>;
		}
		return <Tag color="warning" className={tagClass}>PENDIENTE</Tag>;
	})();

	const commitmentDate = dayjs(item.payDate).format('DD/MM/YYYY');
	const collectionDate = item.paymentDate
		? dayjs(item.paymentDate).format('DD/MM/YYYY')
		: '—';

	const handleApply = () => {
		if (!amount || amount <= 0) {
			notification.warning({ message: 'Ingresa un valor válido para abonar' });
			return;
		}
		const payloadValue = applied + amount;
		payCollection(
			{ paymentId: item.id, value: payloadValue },
			{
				onSuccess: () => {
					setAmount(null);
					notification.success({ message: 'Abono registrado exitosamente' });
				},
				onError: (error) => {
					const msg = handleError(error, 'Error al registrar el abono');
					notification.error({ message: 'Error al registrar el abono', description: msg });
				},
			},
		);
	};

	const goToLoan = () => {
		void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${item.loanId}`, {
			state: { clientId: item.clientId, routesIds: [item.routeId] },
		});
	};

	return (
		<Card size="small" className="collection-today-quota-card" style={cardStyle}>
			<div className="collection-today-quota-head">
				<Space size={4} wrap align="center" className="collection-today-quota-head-left">
					{paid && <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 12 }} aria-hidden />}
					<Text strong className="collection-today-quota-title">
						Cuota {item.quotaNumber}/{item.agreedQuotas}
					</Text>
					<Tag className="collection-today-tag">#{item.loanNumber}</Tag>
				</Space>
				<Button
					type="link"
					size="small"
					icon={<LinkOutlined />}
					onClick={goToLoan}
					className="collection-today-ver-btn"
					aria-label="Ver crédito"
				>
					Ver
				</Button>
			</div>

			<div className="collection-today-quota-dates">
				<span className="collection-today-inline-pair">
					<Text type="secondary">Fecha compromiso pagos:</Text>
					<Text>{commitmentDate}</Text>
				</span>
				<span className="collection-today-inline-pair">
					<Text type="secondary">Fecha recaudo:</Text>
					<Text>{collectionDate}</Text>
				</span>
			</div>

			<div className="collection-today-quota-detail-row">
				<span className="collection-today-inline-pair">
					<Text type="secondary">Estado:</Text>
					{statusTag}
				</span>
				<span className="collection-today-inline-pair">
					<Text type="secondary">{extra > 0 ? 'Base:' : 'Valor:'}</Text>
					<Text strong className="collection-today-quota-amount" style={{ color: token.colorPrimary }}>
						{money(extra > 0 ? fixed : item.value)}
					</Text>
				</span>
			</div>

			{extra > 0 && (
				<div className="collection-today-quota-detail-row">
					<span className="collection-today-inline-pair">
						<Text type="secondary">Abono:</Text>
						<Text strong style={{ color: token.colorSuccess }}>+{money(extra)}</Text>
					</span>
					<span className="collection-today-inline-pair">
						<Text type="secondary">Total:</Text>
						<Text strong className="collection-today-quota-amount" style={{ color: token.colorSuccess }}>
							{money(applied)}
						</Text>
					</span>
				</div>
			)}

			{partial && !paid && (
				<Text type="secondary" className="collection-today-quota-falta" style={{ color: token.colorWarning }}>
					Falta {money(remaining)}
				</Text>
			)}

			{partial && !paid && (
				<div className="collection-today-quota-partial">
					<Progress
						percent={fixed > 0 ? Math.min(100, Math.round((applied / fixed) * 100)) : 0}
						showInfo={false}
						size="small"
						strokeColor={token.colorSuccess}
					/>
					<div className="collection-today-quota-amount-row">
						<Text type="secondary" style={{ fontSize: 10 }}>
							Abonado: {money(applied)}
						</Text>
						<Text type="secondary" style={{ fontSize: 10 }}>
							Cuota: {money(fixed)}
						</Text>
					</div>
				</div>
			)}

			{!paid && (
				<div className="collection-today-apply-row">
					<Space.Compact style={{ width: '100%' }}>
						<InputNumber
							size="small"
							value={amount}
							onChange={(val) => setAmount(val)}
							style={{ width: '100%' }}
							min={1}
							disabled={isPending}
							inputMode="numeric"
							placeholder={
								item.status === PaymentStatus.default
									? 'Abonar mora'
									: 'Abonar valor'
							}
							formatter={(val) => {
								if (val === null || val === undefined || val === '') return '';
								return `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
							}}
							parser={(val) => Number(val?.replace(/\$\s?|(,*)/g, '') ?? 0) as unknown as 0}
							status={item.status === PaymentStatus.default ? 'error' : undefined}
						/>
						<Button
							type="primary"
							size="small"
							onClick={handleApply}
							loading={isPending}
							disabled={!amount || amount <= 0}
							style={
								item.status === PaymentStatus.default
									? { background: token.colorError, borderColor: token.colorError }
									: undefined
							}
						>
							Aplicar
						</Button>
					</Space.Compact>
				</div>
			)}
		</Card>
	);
};
