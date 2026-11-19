import { FC, ReactNode } from 'react';
import { Divider, Flex, Typography } from 'antd';
import './formSection.css';

interface FormSectionProps {
	/** Título de la sección (texto). Si se omite, solo se dibuja el divisor. */
	title?: ReactNode
	/** Contenido a la derecha del título (ej. botones). Reemplaza al título si se pasa `header`. */
	extra?: ReactNode
	/** Cabecera propia (título + acciones). Tiene prioridad sobre `title` y `extra`. */
	header?: ReactNode
	children: ReactNode
}

/**
 * Sección de la configuración: divisor con título en vez de una tarjeta, para no anidar tarjetas
 * dentro de la tarjeta de la pantalla.
 */
export const FormSection: FC<FormSectionProps> = ({ title, extra, header, children }) => (
	<section>
		<Divider style={{ margin: '0 0 12px' }} />
		{header ?? (title || extra) ? (
			<Flex justify="space-between" align="center" gap={12} wrap style={{ marginBottom: 8 }}>
				{header ?? (
					<>
						<Typography.Text strong>{title}</Typography.Text>
						{extra}
					</>
				)}
			</Flex>
		) : null}
		{children}
	</section>
);

export default FormSection;
