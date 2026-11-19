import { FC } from 'react';
import { Input, InputNumber, Select, Switch } from 'antd';
import type { FormRule } from 'antd';
import { CustomFieldDef } from '@/domain/Settings';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { displaySymbol } from '@/infrastructure/utils/money';
import { ConfigurableFormItem } from './ConfigurableFormItem';
import MoneyInput from './InputNumber';
import InputDate from './InputDate';

/** Mismas reglas que el backend (app/core/form_config.py), para dar el error antes de enviar. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const MAX_TEXT = 500;

const typeRules = (definition: CustomFieldDef): FormRule[] => {
	const label = definition.label;
	switch (definition.type) {
		case 'email':
			return [{
				validator: (_, value?: string) => (!value || EMAIL_RE.test(value.trim()) ? Promise.resolve() : Promise.reject(new Error(`«${label}» no es un correo válido`))),
			}];
		case 'phone':
			return [{
				validator: (_, value?: string) => {
					const digits = (value ?? '').replace(/[\s().-]/g, '');
					return !digits || PHONE_RE.test(digits) ? Promise.resolve() : Promise.reject(new Error(`«${label}» no es un teléfono válido`));
				},
			}];
		case 'text':
			return [{ max: MAX_TEXT, message: `«${label}» admite como máximo ${MAX_TEXT} caracteres` }];
		default:
			return [];
	}
};

/** Control de un campo personalizado según su tipo, con su regla de obligatorio y de formato. */
export const CustomFieldInput: FC<{ definition: CustomFieldDef; namePrefix?: string[] }> = ({ definition, namePrefix = [] }) => {
	const name = [...namePrefix, 'customFields', definition.key];
	// Valor monetario: el símbolo es el de la moneda principal de la marca (nunca una fija en el código).
	const primaryCurrency = useAppSettingsStore(state => state.currencies[0]);
	const currencySymbol = useCurrencyStore(state => (primaryCurrency ? displaySymbol(state.catalog[primaryCurrency]?.symbol) : ''));
	const common = { label: definition.label, name, required: definition.required, rules: typeRules(definition) };

	switch (definition.type) {
		case 'money':
			return (
				<ConfigurableFormItem {...common} rules={[]}>
					<MoneyInput
						numberType="positive"
						thousandsSeparator
						emptyValueOutput="null"
						prefix={currencySymbol || undefined}
						placeholder="0"
						inputMode="decimal"
						style={{ width: '100%' }}
					/>
				</ConfigurableFormItem>
			);
		case 'number':
			return (
				<ConfigurableFormItem {...common} rules={[]}>
					<InputNumber style={{ width: '100%' }} placeholder={definition.label} />
				</ConfigurableFormItem>
			);
		case 'email':
			return (
				<ConfigurableFormItem {...common}>
					<Input type="email" inputMode="email" autoComplete="email" placeholder="nombre@correo.com" />
				</ConfigurableFormItem>
			);
		case 'phone':
			return (
				<ConfigurableFormItem {...common}>
					<Input inputMode="tel" placeholder="Teléfono" />
				</ConfigurableFormItem>
			);
		case 'date':
			return (
				<ConfigurableFormItem {...common} rules={[]}>
					<InputDate placeholder="Selecciona una fecha" />
				</ConfigurableFormItem>
			);
		case 'select':
			return (
				<ConfigurableFormItem {...common} rules={[]}>
					<Select
						allowClear
						placeholder="Elige una opción"
						options={definition.options.map(option => ({ label: option, value: option }))}
					/>
				</ConfigurableFormItem>
			);
		case 'boolean':
			return (
				<ConfigurableFormItem {...common} rules={[]} valuePropName="checked">
					<Switch aria-label={definition.label} />
				</ConfigurableFormItem>
			);
		case 'text':
		default:
			return (
				<ConfigurableFormItem {...common}>
					<Input maxLength={MAX_TEXT} placeholder={definition.label} />
				</ConfigurableFormItem>
			);
	}
};

export default CustomFieldInput;
