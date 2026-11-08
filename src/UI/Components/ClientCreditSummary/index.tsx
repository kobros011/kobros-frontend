import { LoanFullRead } from '@/domain/Loan';
import { getListLoans } from '@/infrastructure/querys/Loan';
import { useMoney, useRouteMoney } from '@/infrastructure/hooks/useMoney';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import {
	Col,
	Empty,
	Row,
	Spin,
	Statistic,
	Tag,
	Typography,
	theme,
} from 'antd';
import { FC, ReactNode } from 'react';
import '@/UI/Routes/LoansView/loanWizard.css';

const { Text } = Typography;

const RISK_LABELS = ['Bajo', 'Medio', 'Alto'] as const;
type RiskLevel = 0 | 1 | 2;

function calcRiskLevel(loans: LoanFullRead[]): RiskLevel {
	if (!loans.length) return 0;

	const totalDefault = loans.reduce((acc, l) => acc + parseFloat(l.totalDefault ?? '0'), 0);
	const totalPending = loans.reduce((acc, l) => acc + (l.pendingQuotas ?? 0), 0);
	const totalAgreed = loans.reduce((acc, l) => acc + (l.agreedQuotas ?? 1), 0);
	const pendingRatio = totalAgreed > 0 ? totalPending / totalAgreed : 0;

	if (totalDefault > 100000 || pendingRatio > 0.4) return 2;
	if (totalDefault > 30000 || pendingRatio > 0.15) return 1;
	return 0;
}

function calcViableAmount(loans: LoanFullRead[], riskLevel: RiskLevel): number {
	const activeLoan = loans.find(l => (l.pendingQuotas ?? 0) > 0);
	const baseCapital = parseFloat(activeLoan?.valueCapital ?? '200000');

	const multipliers: Record<RiskLevel, number> = { 0: 1.2, 1: 0.75, 2: 0.4 };
	return Math.round(baseCapital * multipliers[riskLevel] / 10000) * 10000;
}

const RISK_TAG: Record<RiskLevel, 'success' | 'warning' | 'error'> = {
	0: 'success',
	1: 'warning',
	2: 'error',
};

const RISK_MARKER_PERCENT: Record<RiskLevel, number> = { 0: 12, 1: 50, 2: 88 };

const RiskIndicatorTrack: FC<{ riskLevel: RiskLevel }> = ({ riskLevel }) => {
	const { token } = theme.useToken();
	const markerLeft = RISK_MARKER_PERCENT[riskLevel];
	const markerColor =
		riskLevel === 0 ? token.colorSuccess : riskLevel === 1 ? token.colorWarning : token.colorError;

	return (
		<div className="loan-wizard-risk-track" style={{ position: 'relative', marginTop: 4, marginBottom: 4 }}>
			<div style={{ position: 'relative', height: 10 }}>
				<div
					aria-hidden
					style={{
						height: 10,
						borderRadius: 5,
						background: `linear-gradient(to right, ${token.colorSuccess}, ${token.colorWarning}, ${token.colorError})`,
						opacity: 0.85,
					}}
				/>
				<div
					role="img"
					aria-label={`Nivel de riesgo: ${RISK_LABELS[riskLevel]}`}
					style={{
						position: 'absolute',
						left: `${markerLeft}%`,
						top: '50%',
						transform: 'translate(-50%, -50%)',
						width: 16,
						height: 16,
						borderRadius: '50%',
						background: token.colorBgContainer,
						border: `3px solid ${markerColor}`,
						boxShadow: `0 0 0 1px ${token.colorBorder}, 0 2px 6px rgba(0,0,0,0.25)`,
						transition: 'left 200ms ease-out',
					}}
				/>
			</div>
		</div>
	);
};

export const ClientCreditSummaryView: FC<{ loans: LoanFullRead[] }> = ({ loans }) => {
	const { token } = theme.useToken();
	const routeMoney = useRouteMoney();
	const money = useMoney();

	const riskLevel = calcRiskLevel(loans);
	const viableAmount = calcViableAmount(loans, riskLevel);

	const totalCanceled = loans.reduce((a, l) => a + (l.canceledQuotas ?? 0), 0);
	const totalPending = loans.reduce((a, l) => a + (l.pendingQuotas ?? 0), 0);
	const totalDefault = loans.reduce((a, l) => a + parseFloat(l.totalDefault ?? '0'), 0);

	return (
		<>
			<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
				Créditos anteriores
			</Text>
			<div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
				{loans.map((loan) => {
					const mora = parseFloat(loan.totalDefault ?? '0');
					const active = (loan.pendingQuotas ?? 0) > 0;
					return (
						<div key={loan.id} className="loan-wizard-loan-card">
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
								<Text strong>Crédito #{loan.loanNumber}</Text>
								<Tag color={active ? 'warning' : 'success'}>{active ? 'Activo' : 'Cancelado'}</Tag>
							</div>
							<Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
								{loan.paymentMethod} · {routeMoney(Number(loan.valueCapital ?? 0), loan.routeId, { digits: 'brand' })} · {String(loan.initialDate).slice(0, 10)} → {String(loan.endDate).slice(0, 10)}
							</Text>
							<Text
								style={{ fontSize: 12, display: 'block', marginTop: 4 }}
								type={mora > 0 ? 'danger' : 'secondary'}
							>
								{mora > 0 ? `Mora: ${routeMoney(mora, loan.routeId, { digits: 'brand' })}` : 'Sin mora'}
							</Text>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
								<Text style={{ fontSize: 12, color: token.colorSuccess }}>
									<CheckCircleOutlined /> Canceladas: {loan.canceledQuotas ?? 0}
								</Text>
								{(loan.pendingQuotas ?? 0) > 0 && (
									<Text style={{ fontSize: 12, color: token.colorWarning }}>
										<ClockCircleOutlined /> Pendientes: {loan.pendingQuotas}
									</Text>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={8}>
					<div className="loan-wizard-loan-card" style={{ textAlign: 'center' }}>
						<Statistic title="Cuotas canceladas" value={totalCanceled} valueStyle={{ color: token.colorSuccess, fontSize: 28 }} />
					</div>
				</Col>
				<Col xs={24} sm={8}>
					<div className="loan-wizard-loan-card" style={{ textAlign: 'center' }}>
						<Statistic title="Cuotas pendientes" value={totalPending} valueStyle={{ color: token.colorWarning, fontSize: 28 }} />
					</div>
				</Col>
				<Col xs={24} sm={8}>
					<div className="loan-wizard-loan-card" style={{ textAlign: 'center' }}>
						<Statistic
							title="Total en mora"
							value={totalDefault}
							formatter={(v) => money(v as number, { digits: 'brand' })}
							valueStyle={{ color: token.colorError, fontSize: 22 }}
						/>
					</div>
				</Col>
			</Row>

			<div className="loan-wizard-loan-card" style={{ marginBottom: 16 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
					<Text strong>Indicador de Riesgo</Text>
					<Tag color={RISK_TAG[riskLevel]}>{RISK_LABELS[riskLevel].toUpperCase()}</Tag>
				</div>
				<RiskIndicatorTrack riskLevel={riskLevel} />
				<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
					<Text type="secondary" style={{ fontSize: 11 }}>Bajo</Text>
					<Text type="secondary" style={{ fontSize: 11 }}>Medio</Text>
					<Text type="secondary" style={{ fontSize: 11 }}>Alto</Text>
				</div>
			</div>

			<div className="loan-wizard-viable-panel">
				<Text type="secondary" style={{ fontSize: 12 }}>
					Monto viable estimado para nuevo crédito
				</Text>
				<Statistic
					value={viableAmount}
					formatter={(v) => money(v as number, { digits: 'brand' })}
					valueStyle={{ color: token.colorPrimary, fontSize: 28, fontWeight: 700 }}
				/>
				<Text type="secondary" style={{ fontSize: 11 }}>
					Basado en cuotas canceladas, mora y deuda activa
				</Text>
			</div>
		</>
	);
};

export interface ClientCreditSummaryProps {
	clientId: string;
	emptyDescription?: string;
	loadingTip?: string;
	footer?: ReactNode;
}

/** Resumen de créditos, KPIs, riesgo y monto viable (mismo bloque que paso 2 del wizard). */
export const ClientCreditSummary: FC<ClientCreditSummaryProps> = ({
	clientId,
	emptyDescription = 'Sin créditos registrados',
	loadingTip = 'Cargando historial…',
	footer,
}) => {
	const { loans, isLoading } = getListLoans({ clientId }, true);

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
				<Spin tip={loadingTip} />
			</div>
		);
	}

	if (!loans?.length) {
		return (
			<>
				<Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
				{footer}
			</>
		);
	}

	return (
		<>
			<ClientCreditSummaryView loans={loans} />
			{footer}
		</>
	);
};
