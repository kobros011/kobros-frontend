import { BaseDto } from './BaseDto';

export interface ExpensesConceptsDto extends BaseDto {
	concept: string;
	keyIcon: string;
	color: string;
	brand_id: string;
}
