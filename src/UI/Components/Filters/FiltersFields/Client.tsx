import { SelectRoute } from '../../Fields/SelectRoute';
import { ItemFilter } from '..';

export const ClientFiltersFields = () => {

	const fields: ItemFilter[] = [
		{
			key: 'routeId',
			name: 'routeId',
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta para filtrar" />
			),
			isShow: true,
		},
	];

	return fields;
};