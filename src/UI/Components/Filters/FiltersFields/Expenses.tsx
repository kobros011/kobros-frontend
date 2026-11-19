import { ItemFilter } from '..';
import type { CustomFieldDef } from '@/domain/Settings';
import { customFilterItems } from './Client';
import InputDate from '../../Fields/InputDate';
import { SelectConcept } from '../../Fields/SelectConcept';
import { SelectRoute } from '../../Fields/SelectRoute';

export const ExpenseFiltersFields = (hasMultipleRoutes: boolean, customFields: CustomFieldDef[] = []) => {
	const fields: ItemFilter[] = [
		{
			key: 'routeId',
			name: 'routeId',
			colSpan: 6,
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta" />
			),
			isShow: hasMultipleRoutes,
		},
		{
			key: 'date',
			name: 'date',
			colSpan: 5,
			inputComponent: (
				<InputDate allowClear placeholder="Seleccione una fecha" />
			),
			isShow: true,
		},
		{
			key: 'expenseConceptId',
			name: 'expenseConceptId',
			colSpan: 5,
			inputComponent: (
				<SelectConcept readonly allowClear placeholder="Seleccione un concepto" />
			),
			isShow: true,
		},
	];

	return [...fields, ...customFilterItems(customFields)];
};