import { FC, useEffect, useState } from 'react';

import { Button, Card, Col, Progress, Row, Statistic, Typography, theme } from 'antd';

import { DownOutlined, UpOutlined } from '@ant-design/icons';

import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { CollectionKpis } from './groupCollections';
import './collectionToday.css';
import { useMoney } from '@/infrastructure/hooks/useMoney';

const STORAGE_KEY = 'collection-today-kpis-open';

const { Text } = Typography;

interface CollectionTodayKpisProps {
	kpis: CollectionKpis;
}

export const CollectionTodayKpis: FC<CollectionTodayKpisProps> = ({ kpis }) => {
	const money = useMoney();
	const { token } = theme.useToken();
	const isMobile = useUserModeStore((s) => s.isMobile);
	const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, open ? 'true' : 'false');
	}, [open]);

	const pendingColor = kpis.pendingAmount > 0 ? token.colorWarning : token.colorSuccess;

	const statFontSize = isMobile ? 11 : 16;

	const statBlock = (title: string, value: number, valueColor?: string) => (
		<Statistic
			title={title}
			value={value}
			formatter={(val) => money(Number(val))}
			valueStyle={{ fontSize: statFontSize, color: valueColor, lineHeight: 1.15 }}
		/>
	);

	const compactSummary = (
		<Text
			type="secondary"
			className="collection-today-kpis-compact"
			onClick={() => setOpen(true)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
		>
			Pendiente {money(kpis.pendingAmount)}
			{' · '}
			Cobrado {money(kpis.totalCollected)}
			{' · '}
			Meta {money(kpis.totalExpected)}
		</Text>
	);

	return (
		<div className="collection-today-kpis-panel">
			<div className="collection-today-kpis-bar">
				{!open && compactSummary}
				{open && (
					<Text type="secondary" style={{ fontSize: 10 }}>
						{kpis.quotaCount} cuotas · {kpis.clientCount} clientes
					</Text>
				)}
				<Button
					type="link"
					size="small"
					className="collection-today-kpis-toggle"
					icon={open ? <UpOutlined /> : <DownOutlined />}
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
				>
					{open ? 'Ocultar' : 'Ver resumen'}
				</Button>
			</div>

			{open && (
				isMobile ? (
					<Card size="small">
						<Row gutter={[8, 8]} align="middle">
							<Col span={8}>
								{statBlock('A recaudar', kpis.totalExpected)}
							</Col>
							<Col span={8}>
								{statBlock('Cobrado', kpis.totalCollected, token.colorSuccess)}
								<Progress
									percent={kpis.progressPercent}
									size="small"
									showInfo={false}
									strokeColor={token.colorSuccess}
									style={{ marginTop: 4, marginBottom: 0 }}
								/>
							</Col>
							<Col span={8}>
								{statBlock('Pendiente', kpis.pendingAmount, pendingColor)}
								<Text type="secondary" style={{ fontSize: 10 }}>
									{kpis.unpaidQuotaCount} rest.
								</Text>
							</Col>
						</Row>
					</Card>
				) : (
					<Row gutter={[8, 8]}>
						<Col xs={24} sm={8}>
							<Card size="small">
								{statBlock('Total a recaudar hoy', kpis.totalExpected)}
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card size="small">
								{statBlock('Total cobrado', kpis.totalCollected, token.colorSuccess)}
								<Progress
									percent={kpis.progressPercent}
									size="small"
									strokeColor={token.colorSuccess}
									style={{ marginTop: 6 }}
								/>
							</Card>
						</Col>
						<Col xs={24} sm={8}>
							<Card size="small">
								{statBlock('Pendiente por cobrar', kpis.pendingAmount, pendingColor)}
								<Text type="secondary" style={{ fontSize: 11 }}>
									{kpis.unpaidQuotaCount} cuotas restantes
								</Text>
							</Card>
						</Col>
					</Row>
				)
			)}
		</div>
	);
};
