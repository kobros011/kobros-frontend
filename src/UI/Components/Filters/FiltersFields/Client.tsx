import { FC } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import type { FormRule } from 'antd';
import { CustomFieldDef } from '@/domain/Settings';
import { SelectRoute } from '../../Fields/SelectRoute';
import InputDate from '../../Fields/InputDate';
import { ItemFilter } from '..';

/** Mínimo de caracteres para buscar por texto en un campo personalizado (igual que el backend). */
export const CUSTOM_TEXT_FILTER_MIN = 3;

/** Control de un filtro personalizado. Lo envuelve un `Form.Item`, que inyecta `value` y `onChange`: se reenvían al input. */
interface CustomFilterControlProps {
	field: CustomFieldDef
	value?: never
	onChange?: (value: unknown) => void
}

const CustomFilterControl: FC<CustomFilterControlProps> = ({ field, value, onChange }) => {
	const placeholder = `Filtrar por ${field.label.toLowerCase()}`;
	const bound = { value, onChange } as Record<string, unknown>;
	switch (field.type) {
		case 'select':
			return <Select {...bound} allowClear placeholder={placeholder} options={field.options.map(option => ({ label: option, value: option }))} />;
		case 'boolean':
			return <Select {...bound} allowClear placeholder={placeholder} options={[{ label: 'Sí', value: 'true' }, { label: 'No', value: 'false' }]} />;
		case 'number':
		case 'money':
			return <InputNumber {...bound} style={{ width: '100%' }} placeholder={placeholder} />;
		case 'date':
			return <InputDate {...bound} placeholder={placeholder} />;
		case 'email':
			return <Input {...bound} type="email" inputMode="email" allowClear placeholder="correo completo" />;
		case 'phone':
			return <Input {...bound} inputMode="tel" allowClear placeholder="teléfono completo" />;
		default:
			return <Input {...bound} allowClear placeholder={`Escribe al menos ${CUSTOM_TEXT_FILTER_MIN} caracteres`} />;
	}
};

const rulesFor = (field: CustomFieldDef): FormRule[] => {
	if (field.type !== 'text') return [];
	return [{
		validator: (_, value?: string) => (!value || value.trim().length === 0 || value.trim().length >= CUSTOM_TEXT_FILTER_MIN
			? Promise.resolve()
			: Promise.reject(new Error(`Escribe al menos ${CUSTOM_TEXT_FILTER_MIN} caracteres para buscar en «${field.label}»`))),
	}];
};

/** Un filtro por cada campo personalizado filtrable (Clientes, Créditos y Gastos): valores en `customFilters`, se envían como `cf_<clave>`. */
export const customFilterItems = (customFields: CustomFieldDef[] = []): ItemFilter[] => customFields.map(field => ({
	key: `cf_${field.key}`,
	isShow: true,
	withFormITem: true,
	inputComponent: (
		<Form.Item label={field.label} name={['customFilters', field.key]} rules={rulesFor(field)}>
			<CustomFilterControl field={field} />
		</Form.Item>
	),
}));

/**
 * Filtros del listado de clientes: ruta (si la marca tiene varias) y un filtro por cada campo personalizado filtrable.
 * Los valores van a `customFilters` y se envían como `cf_<clave>`.
 */
export const ClientFiltersFields = (customFields: CustomFieldDef[] = [], withRoute = true): ItemFilter[] => {
	const fields: ItemFilter[] = [];

	if (withRoute) {
		fields.push({
			key: 'routeId',
			name: 'routeId',
			inputComponent: (
				<SelectRoute allowClear placeholder="Seleccione una ruta para filtrar" />
			),
			isShow: true,
		});
	}

	return [...fields, ...customFilterItems(customFields)];
};

