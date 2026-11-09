import { Client } from '@/domain/Client';
import { getClient, useMutationType } from '@/infrastructure/querys/Client';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import InputDate from '@/UI/Components/Fields/InputDate';
import { App, Button, Col, Drawer, Form, Input, Row } from 'antd';
import { FC } from 'react';
import { ruleRequired } from '@/constants/rules';
import { ClientContactsList } from '@/UI/Routes/ClientsView/ClientContactsList';


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
	const updateMutation = useMutationType('update');

	const onFinish = (values: Partial<Client>) => {
		if (!client?.id) return;
		startLoading();
		updateMutation.mutate(
			{ ...client, ...values },
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
						<Col xs={24} md={12}>
							<Form.Item label="Nombre completo" name="fullName" rules={[ruleRequired]}>
								<Input placeholder="Nombre completo del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Documento" name="idDocument" rules={[ruleRequired]}>
								<Input inputMode="numeric" placeholder="Documento del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Celular" name="currentMobile" rules={[ruleRequired]}>
								<Input inputMode="tel" placeholder="Celular del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Dirección" name="currentAddress" rules={[ruleRequired]}>
								<Input placeholder="Dirección del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Barrio" name="neighborhood" rules={[ruleRequired]}>
								<Input placeholder="Barrio" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Teléfono" name="currentPhone">
								<Input inputMode="tel" placeholder="Teléfono fijo" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Fecha vinculación" name="linkingDate" rules={[ruleRequired]}>
								<InputDate useCurrentDate disabled placeholder="Fecha vinculación" />
							</Form.Item>
						</Col>

						<Col xs={24}>
							<ClientContactsList />
						</Col>
					</Row>
				</Form>
			)}
		</Drawer>
	);
};
