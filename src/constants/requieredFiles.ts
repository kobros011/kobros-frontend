import { LoanFull } from '@/domain/Loan';

export const nameRequiredFilesLoan = ['currentMobile', 'currentAddress', 'valueCapital', 'valueQuotaFixed', 'agreedQuotas'];
export const nameRequiredFilesLoanMessage: { key: keyof LoanFull, message: string }[] = [
	{ 'key': 'currentMobile', 'message': 'El teléfono móvil es requerido' },
	{ 'key': 'currentAddress', 'message': 'La dirección es requerida' },
	{ 'key': 'valueCapital', 'message': 'El valor capital es requerido' },
	{ 'key': 'valueQuotaFixed', 'message': 'El valor cuota fija es requerido' },
	{ 'key': 'agreedQuotas', 'message': 'Las cuotas pactadas son requeridas' },
];
