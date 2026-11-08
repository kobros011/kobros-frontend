import { FC, useMemo } from 'react';
import { Alert, Form, Input, Select } from 'antd';
import { getSettings } from '@/infrastructure/querys/Settings';
import { getCurrencyCatalog } from '@/infrastructure/querys/Currency';

interface RouteCurrencyFieldProps {
	/** Marca de la ruta (el dev la elige en el formulario; los demás usan la suya). */
	brandId?: string
	disabled?: boolean
}

/**
 * Moneda de la ruta. Solo se elige si la marca tiene más de una: con una sola se muestra (y el servidor la asigna)
 * y con ninguna se avisa que hay que configurarlas antes de crear rutas.
 */
export const RouteCurrencyField: FC<RouteCurrencyFieldProps> = ({ brandId, disabled }) => {
	const { settings, isLoading } = getSettings(brandId, true);
	const { catalog } = getCurrencyCatalog();
	const currencies = settings?.currencies ?? [];

	const options = useMemo(
		() => currencies.map(code => {
			const info = catalog.find(item => item.code === code);
			return { value: code, label: info ? `${code} · ${info.name} (${info.symbol})` : code };
		}),
		[currencies, catalog],
	);

	if (isLoading) return null;

	if (currencies.length === 0) {
		return <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="La marca no tiene monedas configuradas" description="Configúralas en Configuración antes de crear rutas." />;
	}

	if (currencies.length === 1) {
		return (
			<Form.Item label="Moneda" extra="La marca solo usa esta moneda.">
				<Input value={options[0]?.label} disabled aria-label="Moneda de la ruta" />
			</Form.Item>
		);
	}

	return (
		<Form.Item
			label="Moneda"
			name="currency"
			rules={[{ required: true, message: 'Elige la moneda de la ruta' }]}
			extra="No se puede cambiar cuando la ruta ya tiene créditos, gastos, liquidaciones o movimientos."
		>
			<Select options={options} disabled={disabled} placeholder="Moneda de la ruta" aria-label="Moneda de la ruta" showSearch optionFilterProp="label" />
		</Form.Item>
	);
};
