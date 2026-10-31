import { ExpenseDto } from '@/infrastructure/dto/ExpensesDto';
import { BaseDomain } from './BaseDomain';
import { ExpensesConcepts, ExpensesConceptsModel } from './ExpensesConcepts';

export interface Expense extends BaseDomain {
	date: string;
	value: number;
	routeId: string;
	userGenerated?: string;
	expensesConceptId: string;
	expenseConcept?: ExpensesConcepts;
	name: string
}

export class ExpenseModel {
	expense: Expense;

	constructor(expense: Expense) {
		this.expense = expense;
	}

	static ToDomain(DTO: ExpenseDto): Expense {
		return {
			id: DTO.id,
			date: DTO.date,
			value: DTO.value,
			routeId: DTO.route_id,
			userGenerated: DTO.user_generated,
			expensesConceptId: DTO.expensesconcept_id,
			expenseConcept: DTO?.expenseconcept ? ExpensesConceptsModel.ToDomain(DTO.expenseconcept) : undefined,
			name: DTO.name,
			active: DTO.active,
			createdAt: DTO.created_at,
			updatedAt: DTO.updated_at,
		};
	}

	static ToDto(domain: Partial<Expense>): Partial<ExpenseDto> {
		return {
			value: domain.value,
			date: domain.date,
			route_id: domain.routeId,
			expensesconcept_id: domain.expensesConceptId,
			name: domain.name,
			user_generated: domain.userGenerated,
			...(domain?.id ? { id: domain.id } : {}),
		};
	}
}