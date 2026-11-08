import { PaymentMethod } from '@/constants/types';
import { LoanFull } from '@/domain/Loan';
import { parseFormNumber } from '@/infrastructure/utils/formaNumber';
import { FormInstance } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { FieldData } from 'rc-field-form/lib/interface';

export interface LoanDerivedValues {
	daysLoan: string;
	endDate: Dayjs | undefined;
	interestRate: number;
	valueUtilityLoan: number;
	valueTotalLoan: number;
	totalLoan: number;
}

const isFilled = (value: unknown): boolean =>
	value !== undefined && value !== null && value !== '';

const emptyDerived = (): LoanDerivedValues => ({
	daysLoan: '',
	endDate: undefined,
	interestRate: 0,
	valueUtilityLoan: 0,
	valueTotalLoan: 0,
	totalLoan: 0,
});

const resolvePaymentMethod = (value: unknown): PaymentMethod | undefined => {
	if (typeof value === 'string' && (Object.values(PaymentMethod) as string[]).includes(value)) {
		return value as PaymentMethod;
	}
	return undefined;
};

const resolveScheduleStart = (values: Partial<LoanFull>): Dayjs => {
	const raw = values.dateFirstQuota ?? values.initialDate;
	if (raw !== undefined && raw !== null && raw !== '') {
		const parsed = dayjs(raw);
		if (parsed.isValid()) return parsed.startOf('day');
	}
	return dayjs().startOf('day');
};

const endDateConfig = (
	method: PaymentMethod,
	payments: number,
	start: Dayjs,
	fixedDay?: number,
): { endDate: Dayjs; daysLoan: string } => {
	// Día fijo: la última cuota cae en el día elegido del mes (ajustado al último día si el mes es más corto).
	const lastMonth = start.add(payments - 1, 'month');
	const fixedEnd = fixedDay ? lastMonth.date(Math.min(fixedDay, lastMonth.daysInMonth())) : lastMonth;
	const map: Record<PaymentMethod, { endDate: Dayjs; daysLoan: string }> = {
		[PaymentMethod.diary]: {
			endDate: start.add(payments - 1, 'day'),
			daysLoan: `${payments} días`,
		},
		[PaymentMethod.weekly]: {
			endDate: start.add(payments - 1, 'week'),
			daysLoan: `${payments} semanas`,
		},
		[PaymentMethod.fortnightly]: {
			endDate: start.add((payments - 1) * 2, 'week'),
			daysLoan: `${payments * 2} semanas`,
		},
		[PaymentMethod.monthly]: {
			endDate: start.add(payments - 1, 'month'),
			daysLoan: `${payments} meses`,
		},
		[PaymentMethod.fixedDate]: {
			endDate: fixedEnd,
			daysLoan: `${payments} meses (día fijo)`,
		},
	};
	return map[method];
};

/** Qué pasará con la cuota 1 al registrar el "valor pagado hoy" (misma regla del servidor). */
export const describeInitialPayment = (quota: number, payment: number, money: (value: number) => string): string | undefined => {
	if (!(payment > 0) || !(quota > 0)) return undefined;
	if (payment < quota) return `Cuota 1 parcial · faltan ${money(quota - payment)}`;
	if (payment > quota) return `Cuota 1 pagada · saldo a favor ${money(payment - quota)}`;
	return 'Cuota 1 pagada completa';
};

export const formatLoanEndDate = (endDate: Dayjs | undefined): string => {
	if (!endDate?.isValid()) return '—';
	return endDate.format('DD/MM/YYYY');
};

/** Cálculo puro a partir de valores del formulario (no escribe en el form). */
export const computeLoanDerived = (values: Partial<LoanFull>): LoanDerivedValues => {
	if (
		!isFilled(values.agreedQuotas) ||
		!isFilled(values.valueCapital) ||
		!isFilled(values.valueQuotaFixed) ||
		!isFilled(values.paymentMethod)
	) {
		return emptyDerived();
	}

	const method = resolvePaymentMethod(values.paymentMethod);
	if (!method) return emptyDerived();

	const payments = Math.max(1, Math.round(parseFormNumber(values.agreedQuotas)));
	const valueCapital = parseFormNumber(values.valueCapital);
	const fixed = parseFormNumber(values.valueQuotaFixed);
	const canceledQuotas = parseFormNumber(values.canceledQuotas);
	const totalDefault = parseFormNumber(values.totalDefault);

	const schedule = endDateConfig(method, payments, resolveScheduleStart(values), Number(values.fixedPaymentDay) || undefined);

	const calculateValue = fixed * payments;
	const loanUtilidad = calculateValue - valueCapital;
	const interestRate = valueCapital > 0 ? (loanUtilidad / valueCapital) * 100 : 0;
	const totalLoan =
		(canceledQuotas ? calculateValue - fixed * canceledQuotas : calculateValue) + totalDefault;

	return {
		daysLoan: schedule.daysLoan,
		endDate: schedule.endDate,
		interestRate,
		valueUtilityLoan: loanUtilidad,
		valueTotalLoan: calculateValue,
		totalLoan,
	};
};

/** Persiste campos derivados en el form (guardar / carga inicial). */
export const recalculateLoanForm = (form: FormInstance<Partial<LoanFull>>) => {
	const derived = computeLoanDerived(form.getFieldsValue());
	form.setFieldsValue({
		endDate: derived.endDate,
		daysLoan: derived.daysLoan,
		interestRate: derived.interestRate,
		valueUtilityLoan: derived.valueUtilityLoan,
		valueTotalLoan: derived.valueTotalLoan,
		totalLoan: derived.totalLoan,
	});
};

export const useChangeLoan = (_changedFields: FieldData<LoanFull>[], form: FormInstance) => {
	recalculateLoanForm(form);
};
