import { FC } from 'react';
import { Col, ColProps, Divider } from 'antd';
import { CustomFieldDef } from '@/domain/Settings';
import { spanConfigForm } from '@/constants/getSpan';
import CustomFieldInput from './CustomFieldInput';

/**
 * Campos personalizados de un módulo dentro de un `<Row>`: título «Datos adicionales» y un control por campo activo
 * (guardan en `customFields.<clave>`). No pinta nada si no hay campos activos.
 */
export const CustomFieldsSection: FC<{ fields: CustomFieldDef[]; title?: string; namePrefix?: string[]; span?: ColProps }> = ({ fields, title = 'Datos adicionales', namePrefix, span = spanConfigForm.medium }) => {
	if (fields.length === 0) return null;
	return (
		<>
			<Col xs={24}>
				<Divider orientation="left" plain>{title}</Divider>
			</Col>
			{fields.map(field => (
				<Col key={field.key} {...span}>
					<CustomFieldInput definition={field} namePrefix={namePrefix} />
				</Col>
			))}
		</>
	);
};

export default CustomFieldsSection;
