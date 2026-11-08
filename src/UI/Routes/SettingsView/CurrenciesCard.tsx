import { FC, useMemo } from 'react';
import { Alert, Card, Form, FormInstance, Radio, Select } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { SettingsForm } from '@/domain/Settings';
import { getCurrencyCatalog } from '@/infrastructure/querys/Currency';

interface CurrenciesCardProps {
	form: FormInstance<SettingsForm>
	size: SizeType
}

/** Monedas de la marca: se eligen varias del catálogo ISO y una es la principal (la que usan por defecto las rutas nuevas). */
export const CurrenciesCard: FC<CurrenciesCardProps> = ({ form, size }) => {
	const { catalog, isLoading } = getCurrencyCatalog();
	const selected = Form.useWatch('currencies', form) ?? [];

	const options = useMemo(
		() => catalog.map(item => ({ value: item.code, label: `${item.code} · ${item.name} (${item.symbol})` })),
		[catalog],
	);
	const labelOf = (code: string) => catalog.find(item => item.code === code)?.name ?? code;

	/** La principal va primero; el resto conserva su orden. */
	const setPrimary = (code: string) => {
		form.setFieldValue('currencies', [code, ...selected.filter(item => item !== code)]);
		form.setFields([{ name: 'currencies', touched: true }]);
	};

	return (
		<Card type="inner" title="Monedas">
			<Form.Item
				label="Monedas que usa la marca"
				name="currencies"
				rules={[{ required: true, type: 'array', min: 1, message: 'Elige al menos una moneda' }]}
				extra="Cada ruta usa una de estas monedas. Si eliges más de una, la moneda se escoge al crear o editar la ruta."
			>
				<Select
					mode="multiple"
					size={size}
					loading={isLoading}
					options={options}
					optionFilterProp="label"
					placeholder="Busca por código o nombre (COP, USD…)"
					aria-label="Monedas de la marca"
				/>
			</Form.Item>

			{selected.length > 1 && (
				<Form.Item label="Moneda principal" extra="La primera de la lista: la que se propone por defecto y la que se usa cuando un dato no tiene ruta.">
					<Radio.Group
						optionType="button"
						value={selected[0]}
						onChange={event => setPrimary(event.target.value as string)}
						options={selected.map(code => ({ value: code, label: `${code} · ${labelOf(code)}` }))}
					/>
				</Form.Item>
			)}

			{selected.length === 0 && <Alert type="warning" showIcon message="Sin monedas configuradas no se pueden crear rutas." />}
		</Card>
	);
};
