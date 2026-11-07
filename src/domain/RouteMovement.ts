import { RouteMovementDto } from '@/infrastructure/dto/RouteMovementDto';

export type RouteMovementType = 'INGRESO' | 'RETIRO';

export interface RouteMovement {
	id: string;
	routeId: string;
	type: RouteMovementType;
	value: number;
	concept: string;
	userId: string | null;
	userName: string;
	createdAt: string;
}

export class RouteMovementModel {
	static ToDomain(dto: RouteMovementDto): RouteMovement {
		return {
			id: dto.id,
			routeId: dto.route_id,
			type: dto.type,
			value: Number(dto.value),
			concept: dto.concept,
			userId: dto.user_id,
			userName: dto.user_name,
			createdAt: dto.created_at,
		};
	}
}

export interface RouteCashSummary {
	initialValue: number;
	ingresos: number;
	retiros: number;
	cobros: number;
	gastos: number;
	desembolsos: number;
	saldo: number;
}
