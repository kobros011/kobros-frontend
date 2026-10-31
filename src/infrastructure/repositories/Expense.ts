import axios from 'axios';
import { ExpenseDto } from '../dto/ExpensesDto';
import { ImplementationBase } from './base';
import { Expense, ExpenseModel } from '@/domain/Expenses';
import { Filters, FiltersModel } from '@/domain/Filters';

export class ImplementationExpenseRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/expenses/';

	async getExpense(id: string) {
		const response = await axios.get<ExpenseDto>(this.buildUrl({ id: id }));

		return {
			...response,
			expense: ExpenseModel.ToDomain(response?.data),
		};
	}

	async getListExpenses(filters: Partial<Filters>) {
		const response = await axios.get<ExpenseDto[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });
		return {
			...response,
			expenses: response?.data?.map(payment => ExpenseModel.ToDomain(payment)),
		};
	}

	async create(data: Partial<Expense>) {
		if (!data) return;

		return axios.post<ExpenseDto>(this.baseUrl, ExpenseModel.ToDto(data as Expense));	
	}

	async update(data: Partial<Expense>) {
		if (!data || !data.id) return;

		return axios.put<ExpenseDto>(this.buildUrl({ id: data.id }), ExpenseModel.ToDto(data as Expense));	
	}
}

export const repository = new ImplementationExpenseRepository();