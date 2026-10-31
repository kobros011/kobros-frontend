import { BaseDto } from './BaseDto';
import { ExpensesConceptsDto } from './ExpensesConceptsDto';

export interface ExpenseDto extends BaseDto {
	date: string;
	value: number;
	route_id: string;
	user_generated?: string;
	expensesconcept_id: string;
	expenseconcept?: ExpensesConceptsDto,
	name: string;
}