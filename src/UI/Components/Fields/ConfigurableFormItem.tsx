import { FC, ReactNode } from 'react';
import { Form, FormItemProps, Typography } from 'antd';
import type { FormRule } from 'antd';

/** Etiqueta con el marcador "(obligatorio)" u "(opcional)" junto al nombre del campo. */
export const FieldLabel: FC<{ label: string; required: boolean }> = ({ label, required }) => (
	<span>
		{label}{' '}
		<Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
			{required ? '(obligatorio)' : '(opcional)'}
		</Typography.Text>
	</span>
);

interface ConfigurableFormItemProps extends Omit<FormItemProps, 'label' | 'rules' | 'required'> {
	label: string
	/** Si es false, el campo no se pinta ni se valida (la marca lo ocultó). */
	visible?: boolean
	/** Obligatorio según la configuración de la marca. */
	required?: boolean
	/** Reglas propias del tipo de dato (correo, teléfono, longitud…). */
	rules?: FormRule[]
	children: ReactNode
}

/**
 * `Form.Item` que aplica la configuración de la marca: oculto no se pinta; requerido añade la regla con el nombre del
 * campo en el mensaje y muestra "(obligatorio)"; si no, "(opcional)".
 */
export const ConfigurableFormItem: FC<ConfigurableFormItemProps> = ({ label, visible = true, required = false, rules = [], children, ...item }) => {
	if (!visible) return null;

	const allRules: FormRule[] = required
		? [{ required: true, message: `El campo «${label}» es obligatorio` }, ...rules]
		: rules;

	return (
		<Form.Item {...item} label={<FieldLabel label={label} required={required} />} rules={allRules}>
			{children}
		</Form.Item>
	);
};

export default ConfigurableFormItem;
