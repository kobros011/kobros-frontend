import { Client } from '@/domain/Client';
import { getClient, useMutationType } from '@/infrastructure/querys/Client';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import InputDate from '@/UI/Components/Fields/InputDate';
import { App, Button, Col, Divider, Drawer, Form, Input, Row, Typography } from 'antd';
import { FC } from 'react';
import { ruleRequired } from '@/constants/rules';

const { Text } = Typography;

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
							<Form.Item label="Documento (Cédula, DNI)" name="idDocument" rules={[ruleRequired]}>
								<Input inputMode="numeric" placeholder="Documento del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Dirección" name="currentAddress">
								<Input placeholder="Dirección del cliente" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Barrio" name="neighborhood">
								<Input placeholder="Barrio" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Teléfono" name="currentPhone">
								<Input inputMode="tel" placeholder="Teléfono fijo" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Teléfono móvil" name="currentMobile">
								<Input inputMode="tel" placeholder="Teléfono móvil" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Fecha vinculación" name="linkingDate" rules={[ruleRequired]}>
								<InputDate useCurrentDate disabled placeholder="Fecha vinculación" />
							</Form.Item>
						</Col>

						{/* Fiador */}
						<Col xs={24}>
							<Divider orientation="left" style={{ marginTop: 8, marginBottom: 4 }}>
								<Text type="secondary" style={{ fontSize: 13 }}>Fiador (opcional)</Text>
							</Divider>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Nombre del fiador" name="guarantorName">
								<Input placeholder="Nombre completo del fiador" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Cédula del fiador" name="guarantorCedula">
								<Input inputMode="numeric" placeholder="Cédula del fiador" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Teléfono del fiador" name="guarantorPhone">
								<Input inputMode="tel" placeholder="Teléfono del fiador" />
							</Form.Item>
						</Col>
						<Col xs={24} md={12}>
							<Form.Item label="Dirección del fiador" name="guarantorAddress">
								<Input placeholder="Dirección del fiador" />
							</Form.Item>
						</Col>

						{/* Referencias */}
						{[0, 1].map((idx) => (
							<Col xs={24} key={idx}>
								<Divider orientation="left" style={{ marginTop: 8, marginBottom: 4 }}>
									<Text type="secondary" style={{ fontSize: 13 }}>Referencia {idx + 1} (opcional)</Text>
								</Divider>
								<Row gutter={[16, 0]}>
									<Col xs={24} md={12}>
										<Form.Item label="Nombre" name={['references', idx, 'name']}>
											<Input placeholder={`Nombre referencia ${idx + 1}`} />
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										<Form.Item label="Teléfono" name={['references', idx, 'phone']}>
											<Input inputMode="tel" placeholder={`Teléfono referencia ${idx + 1}`} />
										</Form.Item>
									</Col>
									<Col xs={24}>
										<Form.Item label="Dirección" name={['references', idx, 'address']}>
											<Input placeholder={`Dirección referencia ${idx + 1}`} />
										</Form.Item>
									</Col>
								</Row>
							</Col>
						))}
					</Row>
				</Form>
			)}
		</Drawer>
	);
};
