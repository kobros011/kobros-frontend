import { PaymentMethod } from '@/constants/types';
import { PaymentMethodOptions } from '@/constants/OptionsSelects';
import { spanConfigForm } from '@/constants/getSpan';
import { ruleRequired } from '@/constants/rules';
import { LoanFull } from '@/domain/Loan';
import { formatNumber, parseFormNumber } from '@/infrastructure/utils/formaNumber';
import { useCurrency, useMoney } from '@/infrastructure/hooks/useMoney';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Col, Form, FormInstance, Row, Select, Typography } from 'antd';
import { FC, useMemo } from 'react';
import { FieldDateTable } from '@/UI/Components/Fields/MultiFieldsFormItem';
import { computeLoanDerived, describeInitialPayment, formatLoanEndDate } from '../Hooks/useChangeDataLoan';

const { Text } = Typography;

type FieldValue = string | number | undefined | null;

const isFilled = (value: unknown) => value !== undefined && value !== null && value !== '';

/** Datos del crédito (capital, cuota, cuotas, forma de pago, fecha, resumen calculado y cobro inicial) sin botones. */
interface LoanFieldsProps {
	form: FormInstance
	/** Ruta de los campos dentro del formulario (ej. `['loan']`); vacío = en la raíz, como el asistente de crédito. */
	prefix?: string[]
	disabled?: boolean
	/** Crédito opcional: los campos solo son obligatorios cuando se empezó a llenar alguno. */
	optional?: boolean
	/** Distribución compacta (cuota y cuotas, forma de pago y fecha en pares, menos aire entre campos) para formularios largos. */
	compact?: boolean
}

const SummaryRow: FC<{ label: string; value: string | number | undefined; bold?: boolean }> = ({ label, value, bold }) => (
	<div className="loan-wizard-summary-row">
		<Text type={bold ? undefined : 'secondary'} style={{ fontSize: bold ? 14 : 13 }}>
			{label}
		</Text>
		<Text strong={bold} style={{ fontVariantNumeric: 'tabular-nums' }}>
			{value ?? '—'}
		</Text>
	</div>
);

export const LoanFields: FC<LoanFieldsProps> = ({ form, prefix = [], disabled, optional = false, compact = false }) => {
	const money = useMoney();
	const currency = useCurrency();
	const path = (field: string) => (prefix.length ? [...prefix, field] : field);

	const paymentMethod = Form.useWatch(path('paymentMethod'), form) as string | undefined;
	const isFixedDate = paymentMethod === PaymentMethod.fixedDate;

	const valueCapital = Form.useWatch(path('valueCapital'), form) as FieldValue;
	const valueQuotaFixed = Form.useWatch(path('valueQuotaFixed'), form) as FieldValue;
	const agreedQuotas = Form.useWatch(path('agreedQuotas'), form) as FieldValue;
	const dateFirstQuota = Form.useWatch(path('dateFirstQuota'), form) as LoanFull['dateFirstQuota'];
	const valuePayment = Form.useWatch(path('valuePayment'), form) as FieldValue;

	const initialPaymentEffect = describeInitialPayment(parseFormNumber(valueQuotaFixed), parseFormNumber(valuePayment), value => money(value));

	const derived = useMemo(
		() => computeLoanDerived({ valueCapital, valueQuotaFixed, agreedQuotas, paymentMethod, dateFirstQuota } as Partial<LoanFull>),
		[valueCapital, valueQuotaFixed, agreedQuotas, paymentMethod, dateFirstQuota],
	);
	const endDateLabel = formatLoanEndDate(derived.endDate);

	const creditInputsReady = isFilled(valueCapital) && isFilled(valueQuotaFixed) && isFilled(agreedQuotas) && Boolean(paymentMethod);
	// Con el crédito opcional, solo se exige lo que falta una vez que se empezó a llenar.
	const started = isFilled(valueCapital) || isFilled(valueQuotaFixed) || isFilled(agreedQuotas) || Boolean(paymentMethod);
	const rules = !optional || started ? [ruleRequired] : [];

	const moneySummary = (amount: number) => (creditInputsReady ? money(amount) : '—');

	const half = compact ? { span: 12 } : spanConfigForm.large;
	const full = compact ? { span: 24 } : spanConfigForm.large;
	const date = <FieldDateTable label="Fecha 1ra cuota a pagar" useCurrentDate readOnly name={path('dateFirstQuota')} />;

	const paymentBlock = (
		<>
			<Form.Item label="Valor pagado hoy" name={path('valuePayment')} style={{ marginBottom: 12 }} className="loan-wizard-field">
				<InputNumber size="small" thousandsSeparator addonAfter={currency} style={{ width: '100%' }} disabled={disabled} />
			</Form.Item>
			{initialPaymentEffect && (
				<Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>{initialPaymentEffect}</Text>
			)}
		</>
	);
	const summaryBlock = (
		<div className="loan-wizard-summary-panel">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
				<Text strong>Resumen calculado</Text>
				<Text type="secondary" style={{ fontSize: 11 }}>
					<ThunderboltOutlined /> se recalcula al cambiar capital, cuotas o cuota fija
				</Text>
			</div>
			<SummaryRow label="Saldo capital préstamo" value={moneySummary(parseFormNumber(valueCapital))} />
			<SummaryRow label="Saldo utilidad préstamo" value={moneySummary(derived.valueUtilityLoan)} />
			<SummaryRow label="Saldo préstamo + utilidad" value={moneySummary(derived.valueTotalLoan)} />
			<SummaryRow label="Plazo del préstamo" value={creditInputsReady ? derived.daysLoan : '—'} />
			<SummaryRow label="Tasa de interés" value={creditInputsReady ? `${formatNumber(derived.interestRate, 4)}%` : '—'} />
			<SummaryRow label="Fecha final" value={endDateLabel} />
			<SummaryRow label="Total deuda" value={moneySummary(derived.totalLoan)} bold />
		</div>
	);

	return (
		<div className={compact ? 'kb-loan-compact' : undefined}>
			<Row gutter={[compact ? 8 : 12, 4]}>
				<Col {...full}>
					<Form.Item label="Valor capital" name={path('valueCapital')} rules={rules} className="loan-wizard-field">
						<InputNumber size="small" thousandsSeparator addonAfter={currency} style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...half}>
					<Form.Item label="Valor cuota fija" name={path('valueQuotaFixed')} rules={rules} className="loan-wizard-field">
						<InputNumber size="small" thousandsSeparator addonAfter={currency} style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...half}>
					<Form.Item label="Cuotas pactadas" name={path('agreedQuotas')} rules={rules} className="loan-wizard-field">
						<InputNumber size="small" precision={0} style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...half}>
					<Form.Item label="Forma de pago" name={path('paymentMethod')} rules={rules} className="loan-wizard-field">
						<Select size="small" options={PaymentMethodOptions} style={{ width: '100%' }} disabled={disabled} placeholder="Selecciona forma de pago" allowClear />
					</Form.Item>
				</Col>
				{compact && (
					<Col span={12}>
						<Form.Item label="Fecha 1ra cuota" className="loan-wizard-readonly-field">{date}</Form.Item>
					</Col>
				)}
			</Row>

			{isFixedDate && (
				<Form.Item label="Día del mes" name={path('fixedPaymentDay')} rules={[ruleRequired]} className="loan-wizard-field">
					<InputNumber size="small" precision={0} min={1} max={31} style={{ width: '100%' }} disabled={disabled} />
				</Form.Item>
			)}

			{!compact && date}

			{compact ? <>{paymentBlock}{summaryBlock}</> : <>{summaryBlock}{paymentBlock}</>}
		</div>
	);
};
