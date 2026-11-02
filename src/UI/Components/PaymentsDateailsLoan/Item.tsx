import { PaymentBasic } from '@/domain/Payment';
import { PaymentStatus } from '@/constants/types';
import { Badge, Card, Col, Space, theme, Tooltip, Typography } from 'antd';
import { CSSProperties, FC, useMemo } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { FaCheck, FaTimes } from 'react-icons/fa';
import dayjs, { Dayjs } from 'dayjs';

const getMoraDays = (payDate: string, referenceDate: Dayjs): number => {
	const due = dayjs(payDate).startOf('day');
	const ref = referenceDate.startOf('day');
	return Math.max(0, ref.diff(due, 'day'));
};

export const ItemPaymentDetail: FC<{ payment: PaymentBasic }> = ({ payment }) => {
	const { token } = theme.useToken();

	const view = useMemo(() => {
		const isPaid = payment.status === PaymentStatus.paid;
		const isDefault = payment.status === PaymentStatus.default;
		const commitmentFmt = payment.payDate
			? dayjs(payment.payDate).format('DD/MM/YYYY')
			: '—';
		const collectionFmt = payment.paymentDate
			? dayjs(payment.paymentDate).format('DD/MM/YYYY')
			: null;

		let moraDays = 0;
		let paidLate = false;
		let inMora = false;

		if (isPaid && payment.paymentDate) {
			moraDays = getMoraDays(payment.payDate, dayjs(payment.paymentDate));
			paidLate = moraDays > 0;
		} else if (!isPaid && payment.payDate) {
			moraDays = getMoraDays(payment.payDate, dayjs());
			inMora = moraDays > 0 || isDefault;
		}

		const displayDate = isPaid && collectionFmt ? collectionFmt : commitmentFmt;

		let tooltipTitle: string;
		if (isPaid && collectionFmt) {
			tooltipTitle = paidLate
				? `Pagado el ${collectionFmt} · ${moraDays} día${moraDays === 1 ? '' : 's'} de mora`
				: `Pagado el ${collectionFmt}`;
		} else if (inMora) {
			tooltipTitle = `Mora · ${moraDays} día${moraDays === 1 ? '' : 's'} (venció ${commitmentFmt})`;
		} else {
			tooltipTitle = `Pendiente · compromiso ${commitmentFmt}`;
		}

		let subline: string | null = null;
		let sublineColor = token.colorTextSecondary;
		if (paidLate) {
			subline = `Pagó +${moraDays}d`;
			sublineColor = token.colorWarning;
		} else if (inMora && !isPaid) {
			subline = `${moraDays}d mora`;
			sublineColor = token.colorError;
		}

		return {
			isPaid,
			inMora,
			displayDate,
			tooltipTitle,
			subline,
			sublineColor,
			iconColor: isPaid
				? token['lime-6']
				: inMora
					? token['red-6']
					: token['blue-6'],
		};
	}, [payment, token]);

	const styleIcon: CSSProperties = {
		padding: 0,
		margin: 0,
		marginBottom: '-12px',
		marginTop: '-1px',
		fontSize: 23,
	};

	const icon = (() => {
		if (view.isPaid) {
			return <FaCheck color={view.iconColor} style={styleIcon} />;
		}
		if (view.inMora) {
			return <FaTimes color={view.iconColor} style={styleIcon} />;
		}
		return <LuCalendarClock color={view.iconColor} style={styleIcon} />;
	})();

	return (
		<Col xs={8} sm={4} md={2} xl={2}>
			<Badge.Ribbon placement="start" text={payment.quotaNumber}>
				<Card
					hoverable
					styles={{ body: { padding: 5, paddingLeft: 7, minHeight: 72 } }}
					style={{ maxWidth: '5rem' }}
				>
					<Tooltip title={view.tooltipTitle} color={view.iconColor}>
						<Space direction="vertical" align="center" size={2} style={{ width: '100%' }}>
							{icon}
							<Typography.Text
								type="secondary"
								style={{ fontSize: 11, textAlign: 'center', padding: 0, margin: 0, lineHeight: 1.2 }}
							>
								{view.displayDate}
							</Typography.Text>
							{view.subline && (
								<Typography.Text
									style={{
										fontSize: 10,
										textAlign: 'center',
										padding: 0,
										margin: 0,
										lineHeight: 1.1,
										color: view.sublineColor,
									}}
								>
									{view.subline}
								</Typography.Text>
							)}
						</Space>
					</Tooltip>
				</Card>
			</Badge.Ribbon>
		</Col>
	);
};
