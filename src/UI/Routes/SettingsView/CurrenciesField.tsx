import { FC, useMemo } from 'react';
import { Alert, Form, FormInstance, Radio, Select } from 'antd';
import { SettingsForm } from '@/domain/Settings';
import { getCurrencyCatalog } from '@/infrastructure/querys/Currency';

interface CurrenciesFieldProps {
	form: FormInstance<SettingsForm>
}

/** Monedas de la marca: se eligen varias del catálogo ISO y una es la principal (la primera de la lista). */
export const CurrenciesField: FC<CurrenciesFieldProps> = ({ form }) => {
	const { catalog, isLoading } = getCurrencyCatalog();
	const selected = Form.useWatch('currencies', form) ?? [];

	const options = useMemo(
		() => catalog.map(item => ({ value: item.code, label: `${item.code} · ${item.name} (${item.symbol})` })),
		[catalog],
	);

	/** La principal va primero; el resto conserva su orden. */
	const setPrimary = (code: string) => {
		form.setFieldValue('currencies', [code, ...selected.filter(item => item !== code)]);
		form.setFields([{ name: 'currencies', touched: true }]);
	};

	return (
		<div>
			<Form.Item
				name="currencies"
				rules={[{ required: true, type: 'array', min: 1, message: 'Elige al menos una moneda' }]}
			>
				<Select
					mode="multiple"
					loading={isLoading}
					options={options}
					optionFilterProp="label"
					placeholder="Agregar moneda (COP, USD…)"
					aria-label="Monedas de la marca"
				/>
			</Form.Item>

			{selected.length > 1 && (
				<Form.Item label="Moneda principal">
					<Radio.Group
						optionType="button"
						value={selected[0]}
						onChange={event => setPrimary(event.target.value as string)}
						options={selected.map(code => ({ value: code, label: code }))}
					/>
				</Form.Item>
			)}

			{selected.length === 0 && <Alert type="warning" showIcon message="Sin monedas no se pueden crear rutas." />}
		</div>
	);
};
