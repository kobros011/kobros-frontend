import { FC } from 'react';
import { Alert, Empty, Spin } from 'antd';
import { shortName } from '@/UI/Components/Dashboard/DashboardFilters';
import { Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { getLiquidationDetail } from '@/infrastructure/querys/Liquidation';
import { LiquidationActions } from './LiquidationActions';
import { NewLoanList } from './SummaryCards';
import { formatDay, getDifferenceView, getStatusView, signedCOP } from './statusMeta';

const Row: FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
	<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '3px 0' }}>
		<span style={{ color: 'var(--kb-muted)' }}>{label}</span>
		{strong ? <strong className="kb-mono">{value}</strong> : <span className="kb-mono">{value}</span>}
	</div>
);

/** Detalle de un cierre: cuadre guardado, recibos y gastos incluidos, estado y acciones. */
export const LiquidationDetail: FC<{ id: string; isAdmin: boolean; onDone?: () => void }> = ({ id, isAdmin, onDone }) => {
	const { detail, isLoading, isError } = getLiquidationDetail(id);

	if (isLoading) return <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>;
	if (isError || !detail) return <Alert type="error" showIcon message="No se pudo cargar la liquidación" />;

	const status = getStatusView(detail.status, detail.outdated);
	const diff = getDifferenceView(detail.difference ?? 0);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
				<div>
					<strong>{detail.route_name}</strong>
					<div className="kb-section-sub">{formatDay(detail.date)} · {(detail.collector_name ? shortName(detail.collector_name) : 'Consolidado de la ruta')}</div>
				</div>
				<Pill tone={status.tone}>{status.icon} {status.label}</Pill>
			</div>

			{detail.outdated && (
				<Alert type="warning" showIcon message={`Hay cobros o gastos nuevos desde el cierre (vigente: ${formatCOP(detail.current_total_charged)} de recaudo).`}
					description="El cierre está desactualizado: reábrelo para recalcularlo." />
			)}

			<div>
				<Row label="Recaudo" value={formatCOP(detail.total_value_charged)} />
				<Row label="Gastos" value={`−${formatCOP(detail.total_value_expenses)}`} />
				<Row label="Créditos nuevos" value={`−${formatCOP(detail.value_new_loans)}`} />
				<Row label="Base entregada" value={formatCOP(detail.value_base_delivered)} />
				<Row label="Efectivo esperado" value={signedCOP(detail.expected_cash ?? 0)} strong />
				<Row label="Efectivo entregado" value={formatCOP(detail.cash_delivered ?? 0)} strong />
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
					<span style={{ color: 'var(--kb-muted)', fontSize: 13 }}>Diferencia</span>
					<Pill tone={diff.tone}>{diff.icon} {diff.text}</Pill>
				</div>
				{detail.note && <div className="kb-section-sub" style={{ marginTop: 6 }}>Nota: {detail.note}</div>}
				{detail.confirmed_by_name && detail.admin_confirmed_at && (
					<div className="kb-section-sub" style={{ marginTop: 6 }}>Confirmada por {detail.confirmed_by_name} el {formatDay(detail.admin_confirmed_at)}</div>
				)}
			</div>

			<SectionCard icon={null} title={`Recibos incluidos (${detail.payments.length})`}>
				{detail.payments.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin recibos" /> : detail.payments.map(payment => (
					<Row key={payment.id} label={`${payment.client_name} · crédito ${payment.loan_number} · cuota ${payment.quota_number}`} value={formatCOP(payment.applied)} />
				))}
			</SectionCard>
			{detail.expenses.length > 0 && (
				<SectionCard icon={null} title={`Gastos incluidos (${detail.expenses.length})`}>
					{detail.expenses.map(expense => <Row key={expense.id} label={expense.concept ? `${expense.concept} · ${expense.name}` : expense.name} value={formatCOP(expense.value)} />)}
				</SectionCard>
			)}

			{detail.new_loans.length > 0 && (
				<SectionCard icon={null} title={`Créditos nuevos entregados (${detail.new_loans.length})`}>
					<NewLoanList loans={detail.new_loans} />
				</SectionCard>
			)}

			<LiquidationActions id={detail.id} status={detail.status} outdated={detail.outdated} isAdmin={isAdmin} onDone={onDone} />
		</div>
	);
};
