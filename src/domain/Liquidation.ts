import { LiquidationDto } from '@/infrastructure/dto/LiquidationDto';

export interface Liquidation {
	id: string;
	date: string;
	todayCollectionGoal: number;
	valueBaseDelivered: number;
	totalValueCharged: number;
	totalValueExpenses: number;
	valueNewLoans: number;
	routeId: string;
	collectorId: string | null;
	adminConfirmedAt: string | null;
	adminConfirmedBy: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export class LiquidationModel {
	static ToDomain(dto: LiquidationDto): Liquidation {
		return {
			id: dto.id,
			date: dto.date,
			todayCollectionGoal: dto.today_collection_goal,
			valueBaseDelivered: dto.value_base_delivered,
			totalValueCharged: dto.total_value_charged,
			totalValueExpenses: dto.total_value_expenses,
			valueNewLoans: dto.value_new_loans,
			routeId: dto.route_id,
			collectorId: dto.collector_id,
			adminConfirmedAt: dto.admin_confirmed_at,
			adminConfirmedBy: dto.admin_confirmed_by,
			active: dto.active,
			createdAt: dto.created_at,
			updatedAt: dto.updated_at,
		};
	}
}
