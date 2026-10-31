import { PaymentMethod } from '@/constants/types';
import { LoanFull } from '@/domain/Loan';
import { FormInstance } from 'antd';
import dayjs from 'dayjs';
import type { FieldData } from 'rc-field-form/lib/interface';

export const useChangeLoan = (changedFields: FieldData<LoanFull>[], form: FormInstance) => {
	const keysSetEndDate = ['agreedQuotas', 'paymentMethod'];
	const keysSetLoanValues = ['agreedQuotas', 'valueQuotaFixed', 'valueCapital'];

	const setEndDate = () => {
		const payments = form.getFieldValue('agreedQuotas') as number ?? 1;
		const method = form.getFieldValue('paymentMethod') as PaymentMethod;

		const endDate = dayjs().startOf('day');

		const daysConfigData = {
			[PaymentMethod.diary] : {
				endDate: endDate.add(payments, 'day'),
				daysLoan: `${payments} días`,
			},
			[PaymentMethod.weekly] : {
				endDate: endDate.add(payments, 'week'),
				daysLoan: `${payments} semanas`,
			},
			[PaymentMethod.fortnightly] : {
				endDate: endDate.add(payments * 2, 'week'),
				daysLoan: `${payments * 2} semanas`,
			},
			[PaymentMethod.monthly] : {
				endDate: endDate.add(payments, 'month'),
				daysLoan: `${payments} meses`,
			},
			[PaymentMethod.fixedDate] : {
				endDate: endDate.add(payments, 'month'),
				daysLoan: `${payments} meses (día fijo)`,
			},
		};

		const config = daysConfigData[method];
		if (config) {
			form.setFieldValue('endDate', config.endDate);
			form.setFieldValue('daysLoan', config.daysLoan);
		}
	};

	const setLoanValues = () => {
		const payments = form.getFieldValue('agreedQuotas') as number ?? 1;
		const valueCapital = form.getFieldValue('valueCapital') as string ?? 0;
		const fixed = form.getFieldValue('valueQuotaFixed') as string ?? 0;
		const canceledQuotas = form.getFieldValue('canceledQuotas') as number ?? undefined;
		const totalDefault = form.getFieldValue('totalDefault') as string ?? 0;

		const calculateValue = (parseFloat(fixed) ?? 0) * (payments ?? 0);
        
		const loanUtilidad = calculateValue - (parseFloat(valueCapital) ?? 0);
		const interestRate = (loanUtilidad && valueCapital) ? (loanUtilidad * 1 / (parseFloat(valueCapital) ?? 0)) * 100 : 0;

		form.setFieldValue('valueCapital', valueCapital);
		form.setFieldValue('interestRate', interestRate);
		form.setFieldValue('valueUtilityLoan', loanUtilidad);
		form.setFieldValue('valueTotalLoan', calculateValue);

		const totalLoan = (canceledQuotas ?  calculateValue - (parseFloat(fixed) * canceledQuotas) : calculateValue) + parseFloat(totalDefault); 
		form.setFieldValue('totalLoan', totalLoan ?? '0');
	};


	const changedKeys = changedFields.map(field => field?.name?.[0]);

	if (changedKeys.some(key => keysSetEndDate.includes(key ?? ''))) setEndDate();
	if (changedKeys.some(key => keysSetLoanValues.includes(key ?? ''))) setLoanValues();
};