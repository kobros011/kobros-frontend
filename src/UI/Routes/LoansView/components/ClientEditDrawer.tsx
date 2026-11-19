import { Client } from '@/domain/Client';
import { getClient, useMutationType } from '@/infrastructure/querys/Client';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { App, Button, Col, Drawer, Form, Row } from 'antd';
import { FC } from 'react';
import { ClientContactsList } from '@/UI/Routes/ClientsView/ClientContactsList';
import { ClientFields } from '@/UI/Routes/ClientsView/ClientFields';
import { customFieldsPayload } from '@/UI/Routes/ClientsView/customFieldsPayload';
import { useClientFormConfig } from '@/infrastructure/hooks/useClientFormConfig';
import { ContactKind } from '@/domain/Client';


interface ClientEditDrawerProps {
	clientId: string;
	open: boolean;
	onClose: () => void;
	onSaved?: () => void;
}

export const ClientEditDrawer: FC<ClientEditDrawerProps> = ({ clientId, open, onClose, onSaved }) => {
	const { isMobile } = useUserModeStore(state => state);
	const [form] = Form.useForm<Partial<Client>>();
	const { notification } = App.useApp();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { client, isLoading: isLoadingClient } = getClient(clientId);
	const config = useClientFormConfig();
	const contactKinds = (['fiador', 'referencia'] as ContactKind[]).filter(kind => config.isSectionVisible(kind));
	const updateMutation = useMutationType('update');

	const onFinish = (values: Partial<Client>) => {
		if (!client?.id) return;
		const contacts = values.contacts?.filter(contact => config.isSectionVisible(contact.kind));
		if (config.isSectionRequired('fiador') && !(contacts ?? []).some(contact => contact?.kind === 'fiador')) {
			notification.error({ message: 'Debes agregar al menos un fiador' });
			return;
		}
		startLoading();
		updateMutation.mutate(
			{
				...client,
				...values,
				...(contacts ? { contacts } : {}),
				customFields: customFieldsPayload(values.customFields as Record<string, unknown>, config.activeCustomFields),
			},
			{
				onSuccess: () => {
					notification.success({ message: 'Cliente actualizado exitosamente' });
					stopLoading();
					onSaved?.();
					onClose();
				},
				onError: (error) => {
					stopLoading();
					notification.error({ message: error?.message ?? 'Error al actualizar el cliente' });
				},
			},
		);
	};

	return (
		<Drawer
			open={open}
			onClose={onClose}
			placement={isMobile ? 'bottom' : 'right'}
			width={isMobile ? '100%' : 560}
			height={isMobile ? '93%' : 'auto'}
			title="Editar cliente"
			footer={
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
					<Button onClick={onClose}>Cancelar</Button>
					<Button type="primary" onClick={() => form.submit()} loading={isLoading || isLoadingClient}>
						Guardar
					</Button>
				</div>
			}
		>
			{client && (
				<Form
					form={form}
					layout="vertical"
					key={client ? `${client.id}-${client.updatedAt}` : 'new'}
					initialValues={client}
					disabled={isLoading || isLoadingClient}
					onFinish={onFinish}
				>
					<Row gutter={[16, 0]}>
						<ClientFields isDev={false} isCreate={false} />
						{contactKinds.length > 0 && (
							<Col xs={24}>
								<ClientContactsList kinds={contactKinds} />
							</Col>
						)}
					</Row>
				</Form>
			)}
		</Drawer>
	);
};
