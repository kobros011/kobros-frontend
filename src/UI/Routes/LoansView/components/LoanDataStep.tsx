import { PaymentMethod } from '@/constants/types';
import { PaymentMethodOptions } from '@/constants/OptionsSelects';
import { spanConfigForm } from '@/constants/getSpan';
import { ruleRequired } from '@/constants/rules';
import { LoanFull } from '@/domain/Loan';
import { formatNumber, parseFormNumber } from '@/infrastructure/utils/formaNumber';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, Form, FormInstance, Row, Select, Typography } from 'antd';
import { FC, useMemo } from 'react';
import { FieldDateTable } from '@/UI/Components/Fields/MultiFieldsFormItem';
import { computeLoanDerived, describeInitialPayment, formatLoanEndDate } from '../Hooks/useChangeDataLoan';

const { Text } = Typography;

interface LoanDataStepProps {
	form: FormInstance<Partial<LoanFull>>;
	disabled?: boolean;
	onCancel: () => void;
	onSave: () => void;
	isLoading?: boolean;
}

const SummaryRow: FC<{ label: string; value: string | number | undefined; bold?: boolean }> = ({
	label,
	value,
	bold,
}) => (
	<div className="loan-wizard-summary-row">
		<Text type={bold ? undefined : 'secondary'} style={{ fontSize: bold ? 14 : 13 }}>
			{label}
		</Text>
		<Text strong={bold} style={{ fontVariantNumeric: 'tabular-nums' }}>
			{value ?? '—'}
		</Text>
	</div>
);

export const LoanDataStep: FC<LoanDataStepProps> = ({
	form,
	disabled,
	onCancel,
	onSave,
	isLoading,
}) => {
	const paymentMethod = Form.useWatch('paymentMethod', form);
	const isFixedDate = paymentMethod === PaymentMethod.fixedDate;

	const valueCapital = Form.useWatch('valueCapital', form);
	const valueQuotaFixed = Form.useWatch('valueQuotaFixed', form);
	const agreedQuotas = Form.useWatch('agreedQuotas', form);

	const dateFirstQuota = Form.useWatch('dateFirstQuota', form);
	const valuePayment = Form.useWatch('valuePayment', form);
	const initialPaymentEffect = describeInitialPayment(parseFormNumber(valueQuotaFixed), parseFormNumber(valuePayment));

	const derived = useMemo(
		() =>
			computeLoanDerived({
				valueCapital,
				valueQuotaFixed,
				agreedQuotas,
				paymentMethod,
				dateFirstQuota,
			} as Partial<LoanFull>),
		[valueCapital, valueQuotaFixed, agreedQuotas, paymentMethod, dateFirstQuota],
	);

	const endDateLabel = formatLoanEndDate(derived.endDate);

	const creditInputsReady =
		valueCapital != null && valueCapital !== '' &&
		valueQuotaFixed != null && valueQuotaFixed !== '' &&
		agreedQuotas != null && agreedQuotas !== '' &&
		Boolean(paymentMethod);

	const moneySummary = (amount: number) =>
		creditInputsReady ? `$${formatNumber(amount)}` : '—';

	return (
		<>
			<Row gutter={[12, 4]}>
				<Col {...spanConfigForm.large}>
					<Form.Item label="Valor capital" name="valueCapital" rules={[ruleRequired]} className="loan-wizard-field">
						<InputNumber size="small" thousandsSeparator style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...spanConfigForm.large}>
					<Form.Item label="Valor cuota fija" name="valueQuotaFixed" rules={[ruleRequired]} className="loan-wizard-field">
						<InputNumber size="small" thousandsSeparator style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...spanConfigForm.large}>
					<Form.Item label="Cuotas pactadas" name="agreedQuotas" rules={[ruleRequired]} className="loan-wizard-field">
						<InputNumber size="small" precision={0} style={{ width: '100%' }} disabled={disabled} />
					</Form.Item>
				</Col>
				<Col {...spanConfigForm.large}>
					<Form.Item label="Forma de pago" name="paymentMethod" rules={[ruleRequired]} className="loan-wizard-field">
						<Select
							size="small"
							options={PaymentMethodOptions}
							style={{ width: '100%' }}
							disabled={disabled}
							placeholder="Selecciona forma de pago"
							allowClear
						/>
					</Form.Item>
				</Col>
			</Row>

			{isFixedDate && (
				<Form.Item label="Día del mes" name="fixedPaymentDay" rules={[ruleRequired]} className="loan-wizard-field">
					<InputNumber size="small" precision={0} min={1} max={31} style={{ width: '100%' }} disabled={disabled} />
				</Form.Item>
			)}

			<FieldDateTable
				label="Fecha 1ra cuota a pagar"
				useCurrentDate
				readOnly
				name="dateFirstQuota"
			/>

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

			<Form.Item label="Valor pagado hoy" name="valuePayment" style={{ marginBottom: 12 }} className="loan-wizard-field">
				<InputNumber size="small" thousandsSeparator style={{ width: '100%' }} disabled={disabled} />
			</Form.Item>
			{initialPaymentEffect && (
				<Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>{initialPaymentEffect}</Text>
			)}

			<div className="loan-wizard-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
				<Button size="small" onClick={onCancel} disabled={isLoading}>
					Cancelar
				</Button>
				<Button size="small" type="primary" onClick={onSave} loading={isLoading}>
					Guardar
				</Button>
			</div>
		</>
	);
};
