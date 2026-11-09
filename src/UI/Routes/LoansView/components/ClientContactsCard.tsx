import { FC, useState } from 'react';
import { App, Button, Form, Tag, Typography } from 'antd';
import { DownOutlined, EditOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { ClientContact, CONTACT_KIND_LABEL, ContactKind, contactLabel, principalContacts } from '@/domain/Client';
import { updateClientContacts } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import { ClientContactsList } from '@/UI/Routes/ClientsView/ClientContactsList';

const { Text } = Typography;

interface ClientContactsCardProps {
	clientId: string
	contacts?: ClientContact[]
}

const MiniContact: FC<{ kind: ContactKind, contact?: ClientContact }> = ({ kind, contact }) => (
	<div className="loan-wizard-contact">
		<div className="loan-wizard-contact-head">
			<Text strong style={{ fontSize: 12, color: kind === 'fiador' ? 'var(--ant-color-info, #1677ff)' : undefined }}>
				{CONTACT_KIND_LABEL[kind]} · Principal
			</Text>
			{contact && <Text style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{contact.phone}</Text>}
		</div>
		{contact ? (
			<>
				<div style={{ fontSize: 14, fontWeight: 600 }}>{contact.name}</div>
				{contact.address && <Text type="secondary" style={{ fontSize: 12 }}>{contact.address}</Text>}
			</>
		) : (
			<Text type="secondary" style={{ fontSize: 13 }}>Sin registrar</Text>
		)}
	</div>
);

/** Paso 1 del crédito: fiador y referencia principales del cliente, con edición en el lugar (varios contactos). */
export const ClientContactsCard: FC<ClientContactsCardProps> = ({ clientId, contacts = [] }) => {
	const { notification } = App.useApp();
	const [form] = Form.useForm<{ contacts: ClientContact[] }>();
	const [editing, setEditing] = useState(false);
	const [seed, setSeed] = useState<ClientContact[]>([]);
	const [expanded, setExpanded] = useState(false);
	const mutation = updateClientContacts(clientId);

	const { fiador, referencia, others } = principalContacts(contacts);
	const startEditing = (kind?: ContactKind) => {
		setSeed(kind ? [...contacts, { kind, name: '', phone: '', address: '' }] : contacts);
		setEditing(true);
	};

	const onFinish = (values: { contacts?: ClientContact[] }) => {
		mutation.mutate(values.contacts ?? [], {
			onSuccess: () => {
				notification.success({ message: 'Contactos actualizados' });
				setEditing(false);
			},
			onError: error => notification.error({ message: handleError(error, 'No se pudieron guardar los contactos') }),
		});
	};

	if (editing) {
		return (
			// `component={false}`: este bloque va dentro del formulario del asistente y no puede ser otro <form> anidado.
			<Form component={false} form={form} layout="vertical" initialValues={{ contacts: seed }} onFinish={onFinish} disabled={mutation.isPending}>
				<div className="loan-wizard-ref-block loan-wizard-ref-editing">
					<ClientContactsList
						renderHeader={count => (
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
								<div>
									<strong>Editando fiador y referencias</strong>
									<div><Text type="secondary" style={{ fontSize: 12 }}>Los cambios se guardan de inmediato en la ficha del cliente.</Text></div>
								</div>
								<Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{count} en lista</Text>
							</div>
						)}
						emptyText="Sin fiador ni referencias. Agrega uno o guarda para dejarlo sin contactos."
					/>
					<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
						<Button size="small" danger onClick={() => setEditing(false)} disabled={mutation.isPending}>Cancelar</Button>
						<Button size="small" type="primary" onClick={() => form.submit()} loading={mutation.isPending}>
							{mutation.isPending ? 'Guardando…' : 'Guardar contactos'}
						</Button>
					</div>
				</div>
			</Form>
		);
	}

	return (
		<div className="loan-wizard-ref-block">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: contacts.length ? 8 : 0 }}>
				<strong>Fiador y referencias del cliente</strong>
				{contacts.length > 0
					? <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => startEditing()}>Editar contactos</Button>
					: <Text type="secondary" style={{ fontSize: 12 }}>Opcional</Text>}
			</div>

			{contacts.length === 0 ? (
				<>
					<div className="loan-wizard-contacts-empty">
						<strong style={{ display: 'block', fontSize: 13 }}>Sin fiador ni referencias registrados</strong>
						<Text type="secondary" style={{ fontSize: 12 }}>Puedes agregar un fiador o referencia de inmediato para este desembolso.</Text>
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
						<Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => startEditing('fiador')}>Agregar fiador</Button>
						<Button size="small" icon={<PlusOutlined />} onClick={() => startEditing('referencia')}>Agregar referencia</Button>
					</div>
				</>
			) : (
				<>
					<div className="loan-wizard-ref-grid">
						<MiniContact kind="fiador" contact={fiador} />
						<MiniContact kind="referencia" contact={referencia} />
					</div>
					{others.length > 0 && (
						<>
							<Button
								type="text"
								size="small"
								aria-expanded={expanded}
								onClick={() => setExpanded(value => !value)}
								icon={expanded ? <DownOutlined /> : <RightOutlined />}
								style={{ display: 'flex', width: '100%', justifyContent: 'flex-start', paddingInline: 0, marginTop: 4 }}
							>
								+{others.length} {others.length === 1 ? 'contacto más' : 'contactos más'}
								<Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
									{others.map(other => contactLabel(contacts, contacts.indexOf(other)).replace('Referencia', 'Ref')).join(', ')}
								</Text>
							</Button>
							{expanded && (
								<div className="loan-wizard-contacts-more">
									{others.map(other => (
										<div key={other.id ?? `${other.kind}-${other.name}`} className="loan-wizard-contacts-more-row">
											<Tag color={other.kind === 'fiador' ? 'blue' : 'default'} style={{ margin: 0 }}>{contactLabel(contacts, contacts.indexOf(other))}</Tag>
											<span style={{ flex: 1, minWidth: 0 }}>
												<span style={{ fontWeight: 500 }}>{other.name}</span>
												{other.address && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{other.address}</Text>}
											</span>
											<Text style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{other.phone}</Text>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
};
