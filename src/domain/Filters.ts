export interface Filters {
	active: boolean;
	text:   string;
	routeId: string,
	payDate: string,
	status: string,
	textSearch: string,
	withPending: boolean,
	endDate: string,
	initialDate: string,
	paymentMethod: string,
	dateSearchRangeinitialDate: string,
	expenseConceptId: string
	date: string
	clientId: string,
}

export const FiltersKeys = [
	{ dto: 'active', domain: 'active' },
	{ dto: 'text',   domain: 'text'   },
	{ dto: 'route_id',   domain: 'routeId' },
	{ dto: 'pay_date', domain: 'payDate' },
	{ dto: 'status', domain: 'status' },
	{ dto: 'with_pending', domain: 'withPending' },
	{ dto: 'end_date', domain: 'endDate' },
	{ dto: 'initial_date', domain: 'initialDate' },
	{ dto: 'payment_method', domain: 'paymentMethod' },
	{ dto: 'expense_concept_id', domain: 'expenseConceptId' },
	{ dto: 'date', domain: 'date' },
	{ dto: 'client_id', domain: 'clientId' },
] as const;

type FiltersDto = {
	[K in typeof FiltersKeys[number] as K['dto']]:
	Filters[K['domain']]
};

export class FiltersModel {
	static toDto(model: Partial<Filters>): Partial<FiltersDto> {
		return Object.fromEntries(
			FiltersKeys
				.map(({ dto, domain }) => [dto, model[domain]])
				.filter(([, value]) => value !== undefined && value !== null),
		) as Partial<FiltersDto>;
	}
}