import { BaseDto } from './BaseDto';

export interface RouteMovementDto extends BaseDto {
	route_id: string;
	type: 'INGRESO' | 'RETIRO';
	value: number;
	concept: string;
	user_id: string | null;
	user_name: string;
}

export interface RouteMovementCreateDto {
	route_id: string;
	type: 'INGRESO' | 'RETIRO';
	value: number;
	concept: string;
}

export interface RouteCashSummaryDto {
	initial_value: number;
	ingresos: number;
	retiros: number;
	cobros: number;
	gastos: number;
	desembolsos: number;
	saldo: number;
}
