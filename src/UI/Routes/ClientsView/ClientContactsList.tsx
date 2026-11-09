import { FC, ReactNode } from 'react';
import { Button, Col, Form, Input, Row, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ClientContact, ContactKind, CONTACT_KIND_LABEL, contactLabel, contactPosition } from '@/domain/Client';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import './contacts.css';

const { Text } = Typography;

interface ClientContactsListProps {
	/** Campo del formulario que guarda la lista (`ClientContact[]`). */
	name?: string
	/** Sin el título "Fiador y referencias (Opcional)" cuando la tarjeta que lo contiene ya lo muestra. */
	hideHeader?: boolean
	/** Encabezado propio (recibe la cantidad de contactos); sustituye al de por defecto. */
	renderHeader?: (count: number) => ReactNode
	/** Texto cuando todavía no hay contactos. */
	emptyText?: string
}

/** Fiadores y referencias del cliente: varios de cada tipo, se agregan y se quitan; nombre y celular obligatorios. Va dentro de un `Form`. */
export const ClientContactsList: FC<ClientContactsListProps> = ({
	name = 'contacts',
	hideHeader = false,
	renderHeader,
	emptyText = 'Si no agregas contactos, el cliente se guarda sin fiador ni referencias.',
}) => {
	const form = Form.useFormInstance();
	const contacts = (Form.useWatch(name, form) ?? []) as ClientContact[];

	return (
		<DashboardShell>
			<Form.List name={name}>
				{(fields, { add, remove }) => {
					/** Los fiadores van antes que las referencias: un fiador nuevo se inserta tras el último fiador. */
					const addContact = (kind: ContactKind) => add({ kind, name: '', phone: '', address: '' }, kind === 'fiador' ? contacts.filter(contact => contact?.kind === 'fiador').length : undefined);

					return (
						<div className="kb-contacts">
							{renderHeader?.(fields.length)}
							{!hideHeader && !renderHeader && (
								<div className="kb-contacts-head">
									<strong>Fiador y referencias <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>(Opcional)</span></strong>
									<Text type="secondary" style={{ fontSize: 12 }}>{fields.length} {fields.length === 1 ? 'contacto' : 'contactos'}</Text>
								</div>
							)}

							{fields.length === 0 && <div className="kb-contacts-empty">{emptyText}</div>}

							{fields.map((field, index) => {
								const kind = contacts[index]?.kind;
								const label = contactLabel(contacts, index);
								const principal = contactPosition(contacts, index) === 1;
								return (
									<section key={field.key} className="kb-contact" aria-label={label}>
										<div className="kb-contact-head">
											<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
												<Tag color={kind === 'fiador' ? 'blue' : 'default'} className="kb-contact-principal">{kind ? CONTACT_KIND_LABEL[kind] : ''}</Tag>
												{principal ? <Tag color="green" className="kb-contact-principal">Principal</Tag> : <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>}
											</span>
											<Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} aria-label={`Quitar ${label}`}>
												Quitar
											</Button>
										</div>
										<Form.Item name={[field.name, 'kind']} hidden><Input /></Form.Item>
										<Row gutter={8}>
											<Col span={12}>
												<Form.Item label="Nombre" name={[field.name, 'name']} rules={[{ required: true, whitespace: true, message: 'Escribe el nombre' }]}>
													<Input size="small" placeholder="Nombre completo" />
												</Form.Item>
											</Col>
											<Col span={12}>
												<Form.Item label="Celular" name={[field.name, 'phone']} rules={[{ required: true, whitespace: true, message: 'Escribe el celular' }]}>
													<Input size="small" inputMode="tel" placeholder="Celular" />
												</Form.Item>
											</Col>
											<Col span={24}>
												<Form.Item label={<>Dirección <Text type="secondary" style={{ fontSize: 11 }}>(opcional)</Text></>} name={[field.name, 'address']}>
													<Input size="small" placeholder="Dirección" />
												</Form.Item>
											</Col>
										</Row>
									</section>
								);
							})}

							<div className="kb-contacts-actions">
								<Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => addContact('fiador')}>Agregar fiador</Button>
								<Button size="small" icon={<PlusOutlined />} onClick={() => addContact('referencia')}>Agregar referencia</Button>
							</div>
						</div>
					);
				}}
			</Form.List>
		</DashboardShell>
	);
};
