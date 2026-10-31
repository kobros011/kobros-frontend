import { ExpensesConceptsDto } from '@/infrastructure/dto/ExpensesConceptsDto';
import { BaseDomain } from './BaseDomain';


export interface ExpensesConcepts extends BaseDomain {
	concept: string;
	keyIcon: string;
	color: string;
	brandId: string;
}

export class ExpensesConceptsModel {
	expensesConcepts: ExpensesConcepts;

	constructor(expensesConcepts: ExpensesConcepts) {
		this.expensesConcepts = expensesConcepts;
	}

	static ToDomain(DTO: ExpensesConceptsDto): ExpensesConcepts {
		return {
			id: DTO.id,
			concept: DTO.concept,
			keyIcon: DTO.keyIcon,
			brandId: DTO.brand_id,
			color: DTO.color,
			active: DTO.active,
			createdAt: DTO.created_at,
			updatedAt: DTO.updated_at,
		};
	}
	
	static ToDto(domain: Partial<ExpensesConcepts>): Partial<ExpensesConceptsDto> {
		return {
			concept: domain.concept,
			keyIcon: domain.keyIcon,
			color: domain.color,
			brand_id: domain.brandId,
			...(domain?.id ? { id: domain.id } : {}),
		};
	}
}