import { FC, ReactNode } from 'react';
import { Alert, Button, Empty, Spin } from 'antd';
import dayjs from 'dayjs';
import { Pill } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { getLiquidationDetail } from '@/infrastructure/querys/Liquidation';
import { LiquidationActions } from './LiquidationActions';
import { NewLoanList } from './SummaryCards';
import { getDifferenceView, getStatusView, signedCOP } from './statusMeta';

const Line: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
	<div className="lq-audit-line"><span>{label}</span>{children}</div>
);

const Section: FC<{ title: string; total?: ReactNode; children: ReactNode }> = ({ title, total, children }) => (
	<section>
		<h4 className="lq-audit-title"><span>{title}</span>{total}</h4>
		{children}
	</section>
);

/** Detalle de un cierre: estado, cuadre guardado, recibos, gastos y créditos nuevos incluidos, con sus acciones. */
export const LiquidationDetail: FC<{ id: string; isAdmin: boolean; onDone?: () => void }> = ({ id, isAdmin, onDone }) => {
	const { detail, isLoading, isError } = getLiquidationDetail(id);

	if (isLoading) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;
	if (isError || !detail) return <Alert type="error" showIcon message="No se pudo cargar la liquidación" />;

	const status = getStatusView(detail.status, detail.outdated);
	const diff = getDifferenceView(detail.difference ?? 0);
	const confirmedAt = detail.admin_confirmed_at ? dayjs(detail.admin_confirmed_at).format('DD/MM/YYYY hh:mm A') : null;

	return (
		<div className="lq-audit">
			{detail.outdated && (
				<Alert type="warning" showIcon message={`Hay cobros o gastos nuevos desde el cierre (vigente: ${formatCOP(detail.current_total_charged)} de recaudo).`}
					description="El cierre está desactualizado: reábrelo para recalcularlo." />
			)}

			<div className="lq-audit-card">
				<Line label="Estado del arqueo"><Pill tone={status.tone}>{status.icon} {status.label}</Pill></Line>
				{detail.confirmed_by_name && confirmedAt && <Line label="Confirmado por"><strong>{detail.confirmed_by_name} ({confirmedAt})</strong></Line>}
				<Line label="Resultado del cuadre"><Pill tone={diff.tone}>{diff.icon} {diff.text}</Pill></Line>
				{detail.note && <Line label="Nota del cobrador"><span>{detail.note}</span></Line>}
			</div>

			<div className="lq-audit-card">
				<Line label="Recaudo"><span className="kb-mono">{formatCOP(detail.total_value_charged)}</span></Line>
				<Line label="Gastos"><span className="kb-mono">−{formatCOP(detail.total_value_expenses)}</span></Line>
				<Line label="Créditos nuevos"><span className="kb-mono">−{formatCOP(detail.value_new_loans)}</span></Line>
				<Line label="Base entregada"><span className="kb-mono">{formatCOP(detail.value_base_delivered)}</span></Line>
				<Line label="Efectivo esperado"><strong className="kb-mono">{signedCOP(detail.expected_cash ?? 0)}</strong></Line>
				<Line label="Efectivo entregado"><strong className="kb-mono">{formatCOP(detail.cash_delivered ?? 0)}</strong></Line>
			</div>

			<Section title={`Recibos incluidos (${detail.payments.length})`}>
				{detail.payments.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin recibos" /> : (
					<div className="lq-audit-list">
						{detail.payments.map(payment => (
							<div key={payment.id} className="lq-audit-row">
								<div>
									<strong>{payment.client_name}</strong>
									<span className="lq-audit-sub kb-mono">Crédito #{payment.loan_number} · Cuota {payment.quota_number}</span>
								</div>
								<strong className="kb-mono" style={{ color: 'var(--kb-primary)' }}>{formatCOP(payment.applied)}</strong>
							</div>
						))}
					</div>
				)}
			</Section>

			{detail.expenses.length > 0 && (
				<Section title="Gastos comprobados" total={<span className="kb-mono">−{formatCOP(detail.total_value_expenses)}</span>}>
					<div className="lq-audit-list">
						{detail.expenses.map(expense => (
							<div key={expense.id} className="lq-audit-row">
								<div>
									<strong>{expense.name}</strong>
									{expense.concept && <span className="lq-audit-sub">{expense.concept}</span>}
								</div>
								<strong className="kb-mono" style={{ color: 'var(--kb-warn)' }}>{formatCOP(expense.value)}</strong>
							</div>
						))}
					</div>
				</Section>
			)}

			{detail.new_loans.length > 0 && (
				<Section title="Créditos nuevos entregados" total={<span className="kb-mono" style={{ color: 'var(--kb-info)' }}>−{formatCOP(detail.value_new_loans)}</span>}>
					<NewLoanList loans={detail.new_loans} />
				</Section>
			)}

			<div className="lq-audit-footer">
				<LiquidationActions id={detail.id} status={detail.status} outdated={detail.outdated} isAdmin={isAdmin} onDone={onDone} />
				{onDone && <Button type="primary" size="small" onClick={onDone}>Listo</Button>}
			</div>
		</div>
	);
};
