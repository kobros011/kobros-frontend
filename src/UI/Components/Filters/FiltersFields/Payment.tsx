import { SelectRoute } from '../../Fields/SelectRoute';
import { ItemFilter } from '..';
import { Select } from 'antd';
import { PaymentStatusOptions } from '@/constants/OptionsSelects';

export const PaymentFiltersFields = (hasMultipleRoutes: boolean) => {

	const fields: ItemFilter[] = [
		{
			key: 'status',
			name: 'status',
			inputComponent: (
				<Select options={PaymentStatusOptions} allowClear placeholder="Seleccione un estado para filtrar" />
			),
			isShow: true,
		},
		{
			key: 'routeId',
			name: 'routeId',
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta para filtrar" />
			),
			isShow: hasMultipleRoutes,
		},
	];

	return fields;
};