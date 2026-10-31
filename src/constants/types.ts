export enum TypeUser {
	dev = '01', // Desarrolladores
	super = '02', // SuperAdmin
	admin = '03', // Admin
	partner = '04', // Socio
	collector = '05', // Recaudador
}

export type Option = { label: string, value: string | number };

export type TypeAction = 'create' | 'update';

export enum PaymentMethod {
	monthly = 'mensual',
	fortnightly = 'quincenal',
	weekly = 'semanal',
	diary = 'diaria',
	fixedDate = 'dia_fijo',
}

export enum PaymentStatus {
	pending = 'PENDIENTE',
	paid = 'PAGADO',
	default = 'MORA',
}