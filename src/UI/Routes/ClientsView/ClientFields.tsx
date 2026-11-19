import { FC } from 'react';
import { Col, Divider, Form, Input } from 'antd';
import { spanConfigForm } from '@/constants/getSpan';
import { ruleRequired } from '@/constants/rules';
import { useClientFormConfig } from '@/infrastructure/hooks/useClientFormConfig';
import { ConfigurableFormItem } from '@/UI/Components/Fields/ConfigurableFormItem';
import CustomFieldInput from '@/UI/Components/Fields/CustomFieldInput';
import InputDate from '@/UI/Components/Fields/InputDate';
import { SelectBrand } from '@/UI/Components/Fields/SelectBrand';

interface ClientFieldsProps {
	/** Dev elige la marca del cliente. */
	isDev: boolean
	/** Al crear, todos los campos son editables; al editar, la fecha de vinculación queda fija. */
	isCreate: boolean
}

/**
 * Campos del cliente dentro de un formulario de Ant Design. Dirección y celular siempre son obligatorios; el resto
 * sigue la configuración de la marca (oculto, requerido u opcional) y los campos personalizados se muestran al final.
 */
export const ClientFields: FC<ClientFieldsProps> = ({ isDev, isCreate }) => {
	const config = useClientFormConfig();

	return (
		<>
			{isDev && (
				<Col {...spanConfigForm.medium}>
					<Form.Item label="Marca" name="brandId" rules={[ruleRequired]}>
						<SelectBrand disabled={!isCreate} />
					</Form.Item>
				</Col>
			)}

			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem label="Nombre completo" name="fullName" required>
					<Input placeholder="Nombre completo del cliente" />
				</ConfigurableFormItem>
			</Col>
			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem label="Documento" name="idDocument" required>
					<Input inputMode="numeric" placeholder="Documento del cliente" />
				</ConfigurableFormItem>
			</Col>
			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem label="Celular" name="currentMobile" required>
					<Input inputMode="tel" placeholder="Celular del cliente" />
				</ConfigurableFormItem>
			</Col>
			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem label="Dirección" name="currentAddress" required>
					<Input placeholder="Dirección del cliente" />
				</ConfigurableFormItem>
			</Col>

			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem
					label="Barrio"
					name="neighborhood"
					visible={config.isFieldVisible('neighborhood')}
					required={config.isFieldRequired('neighborhood')}
				>
					<Input placeholder="Barrio del cliente" />
				</ConfigurableFormItem>
			</Col>
			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem
					label="Teléfono"
					name="currentPhone"
					visible={config.isFieldVisible('current_phone')}
					required={config.isFieldRequired('current_phone')}
				>
					<Input inputMode="tel" placeholder="Teléfono del cliente" />
				</ConfigurableFormItem>
			</Col>
			<Col {...spanConfigForm.medium}>
				<ConfigurableFormItem
					label="Fecha vinculación"
					name="linkingDate"
					visible={config.isFieldVisible('linking_date')}
					required={config.isFieldRequired('linking_date')}
				>
					<InputDate useCurrentDate disabled={!isCreate} placeholder="Fecha vinculación del cliente" />
				</ConfigurableFormItem>
			</Col>

			{config.activeCustomFields.length > 0 && (
				<>
					<Col xs={24}>
						<Divider orientation="left" plain>Datos adicionales</Divider>
					</Col>
					{config.activeCustomFields.map(field => (
						<Col key={field.key} {...spanConfigForm.medium}>
							<CustomFieldInput definition={field} />
						</Col>
					))}
				</>
			)}
		</>
	);
};

export default ClientFields;
