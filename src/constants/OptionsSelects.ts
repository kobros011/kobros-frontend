import { Option, PaymentMethod, TypeUser } from './types';

export const TypeUserOptionSuper: Option = { label: 'Super Usuario', value: TypeUser.super };
export const TypeUserOptionAdmin: Option = { label: 'Administrador', value: TypeUser.admin };
export const TypeUserOptionPartner: Option = { label: 'Socio', value: TypeUser.partner };
export const TypeUserOptionCollector: Option = { label: 'Recaudador', value: TypeUser.collector };

export const TypeUserOptions: Option[] = [
	TypeUserOptionSuper,
	TypeUserOptionAdmin,
	TypeUserOptionPartner,
	TypeUserOptionCollector,
];

export const PaymentMethodMonthly: Option = { label: 'MENSUAL', value: PaymentMethod.monthly };
export const PaymentMethodFortnightly: Option = { label: 'QUINCENAL', value: PaymentMethod.fortnightly };
export const PaymentMethodWeekly: Option = { label: 'SEMANAL', value: PaymentMethod.weekly };
export const PaymentMethodDiary: Option = { label: 'DIARIA', value: PaymentMethod.diary };
export const PaymentMethodFixedDate: Option = { label: 'DÍA FIJO', value: PaymentMethod.fixedDate };

export const PaymentMethodOptions: Option[] = [
	PaymentMethodDiary,
	PaymentMethodWeekly,
	PaymentMethodFortnightly,
	PaymentMethodMonthly,
	PaymentMethodFixedDate,
];

export const PaymentStatusPending: Option = { label: 'PENDIENTE', value: 'PENDIENTE' };
export const PaymentStatusPay: Option = { label: 'PAGADO', value: 'PAGADO' };
export const PaymentStatusDefault: Option = { label: 'MORA', value: 'MORA' };

export const PaymentStatusOptions: Option[] = [
	PaymentStatusPending,
	PaymentStatusPay,
	PaymentStatusDefault,
];