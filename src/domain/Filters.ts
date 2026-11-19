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
	/** Filtros de campos personalizados del cliente: clave -> valor (se envían como cf_<clave>). */
	customFilters: Record<string, string>,
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
		const base: Record<string, unknown> = Object.fromEntries(
			FiltersKeys
				.map(({ dto, domain }) => [dto, model[domain]] as [string, unknown])
				.filter(([, value]) => value !== undefined && value !== null),
		);
		// Campos personalizados: cada valor no vacío viaja como cf_<clave>. Las claves ya vienen validadas por la configuración.
		const custom = Object.fromEntries(
			Object.entries(model.customFilters ?? {})
				.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
				.map(([key, value]) => [`cf_${key}`, String(value).trim()]),
		);
		return { ...base, ...custom } as Partial<FiltersDto>;
	}
}