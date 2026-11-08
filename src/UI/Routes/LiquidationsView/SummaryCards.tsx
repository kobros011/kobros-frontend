import { FC } from 'react';
import { Empty } from 'antd';
import { DollarOutlined, FallOutlined, FlagOutlined, RiseOutlined, WalletOutlined } from '@ant-design/icons';
import { Pill, SectionCard } from '@/UI/Components/Dashboard/ui';
import { RadialGauge, toneByCompliance } from '@/UI/Components/Dashboard/charts';
import { formatCOP } from '@/UI/Components/Dashboard/format';
import { ClosingFiguresDto, ExpenseLineDto, NewLoanLineDto } from '@/infrastructure/dto/LiquidationDto';

const Row: FC<{ label: string; value: string; tone?: 'ok' | 'warn' | 'danger' }> = ({ label, value, tone }) => (
	<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '3px 0' }}>
		<span style={{ color: 'var(--kb-muted)' }}>{label}</span>
		<strong className="kb-mono" style={tone ? { color: `var(--kb-${tone})` } : undefined}>{value}</strong>
	</div>
);

/** "Recaudo del día": total cobrado y su desglose (todo automático, por fecha de cobro). */
export const CollectionCard: FC<{ figures: ClosingFiguresDto }> = ({ figures }) => (
	<SectionCard
		icon={<DollarOutlined />}
		title="Recaudo del día"
		subtitle="Cálculo automático de recibos"
		extra={<Pill tone="neutral">{figures.receipts_count} {figures.receipts_count === 1 ? 'recibo' : 'recibos'}</Pill>}
	>
		<div style={{ marginBottom: 8 }}>
			<span className="kb-kpi-value">{formatCOP(figures.collected_total)}</span>
			<span className="kb-kpi-unit">COP</span>
		</div>
		<div className="lq-tiles">
			<div className="lq-figure"><span>Cuotas de hoy</span><strong className="kb-mono" style={{ color: 'var(--kb-ok)' }}>{formatCOP(figures.collected_due_today)}</strong></div>
			<div className="lq-figure"><span>Atrasadas cobradas</span><strong className="kb-mono" style={{ color: 'var(--kb-warn)' }}>{formatCOP(figures.collected_overdue)}</strong></div>
			<div className="lq-figure"><span>Abonos parciales ({figures.partial_count})</span><strong className="kb-mono">{figures.partial_count}</strong></div>
		</div>
		<div style={{ marginTop: 10 }}>
			<Pill tone="ok"><RiseOutlined /> Saldo a favor generado (excedentes): +{formatCOP(figures.beak_generated)}</Pill>
		</div>
	</SectionCard>
);

/** Avance de cuotas de hoy cobradas frente a la meta del día. */
export const GoalCard: FC<{ figures: ClosingFiguresDto; percent: number }> = ({ figures, percent }) => (
	<SectionCard icon={<FlagOutlined />} title="Meta de cobranza" subtitle="Avance de cuotas de hoy">
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
			<div>
				<strong className="kb-mono" style={{ fontSize: 16 }}>{formatCOP(figures.collected_due_today)}</strong>
				<div className="kb-section-sub">de {formatCOP(figures.goal)} esperados hoy</div>
			</div>
			<RadialGauge percent={percent} size={72} tone={toneByCompliance(percent)} />
		</div>
	</SectionCard>
);

export const ExpensesCard: FC<{ total: number; expenses: ExpenseLineDto[] }> = ({ total, expenses }) => (
	<SectionCard
		icon={<FallOutlined />}
		tone="warn"
		title="Gastos del día"
		extra={<strong className="kb-mono" style={{ color: 'var(--kb-warn)' }}>−{formatCOP(total)}</strong>}
	>
		{expenses.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin gastos registrados hoy" /> : (
			<div className="lq-scroll" tabIndex={0} aria-label="Gastos del día">
				{expenses.map(expense => <Row key={expense.id} label={expense.concept ? `${expense.concept} · ${expense.name}` : expense.name} value={formatCOP(expense.value)} />)}
			</div>
		)}
	</SectionCard>
);

export const NewLoansCard: FC<{ total: number; loans: NewLoanLineDto[] }> = ({ total, loans }) => (
	<SectionCard
		icon={<WalletOutlined />}
		tone="primary"
		title="Créditos nuevos entregados"
		subtitle={`${loans.length} ${loans.length === 1 ? 'desembolso' : 'desembolsos'} en ruta`}
		extra={<strong className="kb-mono" style={{ color: 'var(--kb-danger)' }}>−{formatCOP(total)}</strong>}
	>
		{loans.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin créditos nuevos hoy" /> : <NewLoanList loans={loans} />}
	</SectionCard>
);

/** Cada crédito del día: capital prestado (lo que sale de caja) y total a pagar. */
export const NewLoanList: FC<{ loans: NewLoanLineDto[] }> = ({ loans }) => (
	<div className="lq-scroll" tabIndex={0} aria-label="Créditos nuevos del día">
		{loans.map(loan => (
			<div key={loan.id} className="kb-row" style={{ padding: '8px 10px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
					<strong>{loan.client_name} <span className="kb-mono kb-section-sub">#{loan.loan_number}</span></strong>
					<strong className="kb-mono" style={{ color: 'var(--kb-primary)' }}>Capital {formatCOP(loan.value_capital)}</strong>
				</div>
				<div className="kb-section-sub kb-mono">
					Total {formatCOP(loan.value_total_loan)} · {loan.agreed_quotas} cuotas de {formatCOP(loan.value_quota_fixed)}
				</div>
			</div>
		))}
	</div>
);
