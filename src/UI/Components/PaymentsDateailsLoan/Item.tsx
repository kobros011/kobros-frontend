import { PaymentBasic } from '@/domain/Payment';
import { Badge, Card, Col, Space, theme, Tooltip, Typography } from 'antd';
import { CSSProperties, FC } from 'react';
import { LuCalendarClock } from 'react-icons/lu';
import { FaCheck, FaTimes } from 'react-icons/fa';
import dayjs from 'dayjs';

export const ItemPaymentDetail: FC<{ payment: PaymentBasic }> = ({ payment }) => {
	const { token } = theme.useToken();
	const getIcon = () => {
		const styleIcon: CSSProperties = { 
			padding: 0,
			margin: 0,
			marginBottom: '-12px',
			marginTop: '-1px',
			fontSize: 23,
		};

		if (payment.status.toUpperCase() == 'PAGADO') return <Tooltip title='PAGADO' color={token['lime-6']}><FaCheck color={token['lime-6']} style={styleIcon} /></Tooltip>;
		else if (payment.status.toUpperCase() == 'MORA') return <Tooltip title="MORA" color={token['red-6']}><FaTimes color={token['red-6']} style={styleIcon} /></Tooltip>;
    
		return <Tooltip title="PENDIENTE" color={token['blue-6']}><LuCalendarClock color={token['blue-6']} style={styleIcon} /></Tooltip>;
	};

	return (
		<Col
			xs={8}
			sm={4}
			md={2}
			xl={2}
		>
			<Badge.Ribbon placement="start" text={payment.quotaNumber}>
				<Card
					hoverable
					styles={{ body: { padding: 5, paddingLeft: 7, maxHeight: 100 } }}
					style={{ maxWidth: '5rem' }}
				>
					<Space direction="vertical" align="center">
						{getIcon()}
						<Typography.Text type="secondary" style={{ fontSize: 12, textAlign: 'center', padding: 0, margin: 0 }}>{payment.payDate ? dayjs(payment.payDate?.toString()).format('DD/MM/YYYY') : '--:--'}</Typography.Text>
					</Space>
				</Card>
			</Badge.Ribbon>
		</Col>
	);
};