import axios from 'axios';
import { ImplementationBase } from './base';
import { ExpensesConceptsDto } from '../dto/ExpensesConceptsDto';
import { ExpensesConcepts, ExpensesConceptsModel } from '@/domain/ExpensesConcepts';

export class ImplementationExpenseConceptRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/expensesconcepts/';

	async getExpenseConcept(id: string) {
		const response = await axios.get<ExpensesConceptsDto>(this.buildUrl({ id: id }));

		return {
			...response,
			expense: ExpensesConceptsModel.ToDomain(response?.data),
		};
	}

	/** Sin `active` el backend devuelve solo los conceptos activos (comportamiento por defecto). */
	async getListExpensesConcepts(active?: boolean) {
		const response = await axios.get<ExpensesConceptsDto[]>(this.baseUrl, { params: active === undefined ? undefined : { active } });
		return {
			...response,
			expensesConcepts: response?.data?.map(payment => ExpensesConceptsModel.ToDomain(payment)),
		};
	}

	async delete(concept_id: string) {
		return axios.put(this.buildUrl({ id: concept_id, method: 'toggle' }));
	}

	async create(data: Partial<ExpensesConcepts>) {
		if (!data) return;

		return axios.post<ExpensesConceptsDto>(this.baseUrl, ExpensesConceptsModel.ToDto(data as ExpensesConcepts));	
	}

	async update(data: Partial<ExpensesConcepts>) {
		if (!data || !data.id) return;

		return axios.put<ExpensesConcepts>(this.buildUrl({ id: data.id }), ExpensesConceptsModel.ToDto(data as ExpensesConcepts));	
	}
}

export const repository = new ImplementationExpenseConceptRepository();