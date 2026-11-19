import { FC } from 'react';
import { Flex } from 'antd';
import FormSection from './FormSection';
import { ClientFormConfig, CONFIGURABLE_CLIENT_FIELDS, ConfigurableClientField } from '@/domain/Settings';
import ConfigRow from './ConfigRow';
import { normalizeFlags } from './helpers';

const CONFIGURABLE_DESCRIPTIONS: Record<ConfigurableClientField, string> = {
	current_phone: 'Teléfono fijo o de contacto',
	neighborhood: 'Barrio o sector del cliente',
	linking_date: 'Si no es obligatoria y se deja vacía, se usa la fecha de hoy',
};

interface FieldsTableProps {
	draft: ClientFormConfig
	onChange: (next: ClientFormConfig) => void
}

/** Campos del cliente que la marca puede configurar (Requerido y Visible). */
export const FieldsTable: FC<FieldsTableProps> = ({ draft, onChange }) => {
	const setField = (field: ConfigurableClientField, patch: { required?: boolean; visible?: boolean }) => {
		const next = normalizeFlags({ ...draft.fields[field], ...patch });
		onChange({ ...draft, fields: { ...draft.fields, [field]: next } });
	};

	return (
		<FormSection title="Campos del cliente">
			<Flex vertical>
				{(Object.keys(CONFIGURABLE_CLIENT_FIELDS) as ConfigurableClientField[]).map(field => (
					<ConfigRow
						key={field}
						title={CONFIGURABLE_CLIENT_FIELDS[field]}
						description={CONFIGURABLE_DESCRIPTIONS[field]}
						required={draft.fields[field].required}
						visible={draft.fields[field].visible}
						onRequiredChange={required => setField(field, { required })}
						onVisibleChange={visible => setField(field, { visible })}
					/>
				))}
			</Flex>
		</FormSection>
	);
};

export default FieldsTable;
