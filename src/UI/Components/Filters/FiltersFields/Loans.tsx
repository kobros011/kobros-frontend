import { Select } from 'antd';
import { ItemFilter } from '..';
import { PaymentMethodOptions } from '@/constants/OptionsSelects';
import { SelectRoute } from '../../Fields/SelectRoute';
import RangeDate from '../../Fields/RangePickerField';

export const LoansFiltersFields = (hasMultipleRoutes: boolean) => {

	const fields: ItemFilter[] = [
		{
			key: 'paymentMethod',
			name: 'paymentMethod',
			inputComponent: (<Select options={PaymentMethodOptions} allowClear placeholder="Seleccione una forma de pago" />),
			isShow: true,
			colSpan: 5,
		},
		{
			key: 'routeId',
			name: 'routeId',
			colSpan: 6,
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta para filtrar" />
			),
			isShow: hasMultipleRoutes,
		},
		{
			key: 'filterDates',
			inputComponent: (
				<RangeDate
					nameInputInitial="initialDate"
					nameInputEnd="endDate"
					placeholder={['Fecha inicial', 'Fecha Final']}
				/>
			),
			isShow: true,
		},
	];

	return fields;
};