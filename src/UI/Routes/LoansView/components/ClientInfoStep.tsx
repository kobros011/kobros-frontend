import { Client } from '@/domain/Client';
import { Route } from '@/domain/Route';
import { LoanFull } from '@/domain/Loan';
import { FormInstance, Form, Button, Typography, Select, Spin, Input } from 'antd';
import { FC, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import { FieldOrderTable } from '@/UI/Components/Fields/MultiFieldsFormItem';
import { SelectClient } from '@/UI/Components/Fields/SelectClient';
import { ClientEditDrawer } from './ClientEditDrawer';
import { FichaField } from './FichaField';

const { Text } = Typography;

interface ClientInfoStepProps {
	form: FormInstance<Partial<LoanFull>>;
	client?: Client;
	clientId?: string;
	routeId?: string;
	routeName?: string;
	onContinue: () => void;
	onClientSaved?: () => void;
	routes?: Route[];
	hasRoute: boolean;
	hasClientId: boolean;
	onRouteSelected?: (route: Route) => void;
	onClientSelected?: (clientId: string) => void;
	isLoadingClient?: boolean;
}

export const ClientInfoStep: FC<ClientInfoStepProps> = ({
	form,
	client,
	clientId,
	routeId,
	routeName,
	onContinue,
	onClientSaved,
	routes = [],
	hasRoute,
	hasClientId,
	onRouteSelected,
	onClientSelected,
	isLoadingClient = false,
}) => {
	const [drawerOpen, setDrawerOpen] = useState(false);

	const guarantor = client?.guarantorName;
	const ref1 = client?.references?.[0];
	const ref2 = client?.references?.[1];

	const handleContinue = () => {
		const mobile = form.getFieldValue('currentMobile') as string | undefined;
		const address = form.getFieldValue('currentAddress') as string | undefined;
		if (!mobile || !address) return;
		onContinue();
	};

	const showClientFields = hasClientId && !!client;
	const showRoutePicker = routes.length > 1 && !hasRoute;
	const showClientLoading =
		hasClientId && !!routeId && isLoadingClient && !client && !showRoutePicker;

	const idDocument = (Form.useWatch('idDocument', form) as string | undefined) ?? client?.idDocument;
	const fullName = (Form.useWatch('fullName', form) as string | undefined) ?? client?.fullName;
	const routeNameValue = (Form.useWatch('routeName', form) as string | undefined) ?? client?.routeName;

	return (
		<>
			<Form.Item name="idDocument" hidden>
				<Input />
			</Form.Item>
			<Form.Item name="fullName" hidden>
				<Input />
			</Form.Item>
			<Form.Item name="routeName" hidden>
				<Input />
			</Form.Item>
			<Form.Item name="order" hidden>
				<Input />
			</Form.Item>

			{routes.length > 1 && (
				<FichaField label="Ruta">
					{hasRoute && routeName ? (
						<Text strong>{routeName}</Text>
					) : (
						<div className="loan-wizard-editable">
							<Select
								size="small"
								style={{ width: '100%' }}
								placeholder="Selecciona una ruta"
								options={routes.map(r => ({ label: r.name, value: r.id }))}
								onSelect={(value: string) => {
									const route = routes.find(r => r.id === value);
									if (route) onRouteSelected?.(route);
								}}
							/>
						</div>
					)}
				</FichaField>
			)}

			{hasRoute && !hasClientId && (
				<FichaField label="Cliente">
					<div className="loan-wizard-editable">
						<SelectClient
							routeId={routeId}
							style={{ width: '100%' }}
							placeholder="Buscar cliente por nombre o cédula"
							onSelect={(_, option) => onClientSelected?.(option.data.id)}
						/>
					</div>
				</FichaField>
			)}

			{showClientLoading && (
				<div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
					<Spin tip="Cargando datos del cliente…" />
				</div>
			)}

			{showClientFields && (
				<>
					<FichaField label="Cédula del cliente (DNI)">
						{idDocument}
					</FichaField>
					{(client?.beak ?? 0) > 0 && (
						<FichaField label="Saldo a favor">
							${Math.round(client?.beak ?? 0).toLocaleString('es-CO')}
						</FichaField>
					)}

					<FichaField label="Nombre del cliente">
						<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
							<span>{fullName}</span>
							<Button type="link" icon={<RightOutlined />} iconPosition="end" onClick={() => setDrawerOpen(true)} style={{ padding: 0 }}>
								Editar cliente
							</Button>
						</div>
					</FichaField>

					<div className="loan-wizard-ref-block">
						<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
							Fiador y referencias del cliente
						</Text>
						<div className="loan-wizard-ref-grid">
							<div>
								<Text type="secondary" style={{ fontSize: 11 }}>Fiador</Text>
								<div style={{ fontSize: 14, fontWeight: 500 }}>
									{guarantor || 'Sin registrar'}
								</div>
								{client?.guarantorPhone && (
									<Text type="secondary" style={{ fontSize: 11 }}>{client.guarantorPhone}</Text>
								)}
							</div>
							<div>
								<Text type="secondary" style={{ fontSize: 11 }}>Referencia 1</Text>
								<div style={{ fontSize: 14, fontWeight: 500 }}>
									{ref1?.name || 'Sin registrar'}
								</div>
								{ref1?.phone && <Text type="secondary" style={{ fontSize: 11 }}>{ref1.phone}</Text>}
							</div>
							<div>
								<Text type="secondary" style={{ fontSize: 11 }}>Referencia 2</Text>
								<div style={{ fontSize: 14, fontWeight: 500 }}>
									{ref2?.name || 'Sin registrar'}
								</div>
								{ref2?.phone && <Text type="secondary" style={{ fontSize: 11 }}>{ref2.phone}</Text>}
							</div>
						</div>
					</div>

					<Form.Item label="Dirección" name="currentAddress" style={{ marginBottom: 12 }} className="loan-wizard-field">
						<Input size="small" placeholder="Dirección del cliente" />
					</Form.Item>

					<Form.Item label="Teléfono móvil" name="currentMobile" style={{ marginBottom: 12 }} className="loan-wizard-field">
						<Input size="small" inputMode="tel" placeholder="Teléfono móvil del cliente" />
					</Form.Item>

					{routes.length <= 1 && (
						<FichaField label="Ruta del cliente">
							{routeNameValue || client?.routeName || routeName}
						</FichaField>
					)}

					{clientId && (
						<FieldOrderTable
							label="Nueva prioridad"
							clientId={clientId}
							routeId={routeId}
							name="newOrder"
						/>
					)}

					<div className="loan-wizard-cta-row">
						<Button size="small" type="primary" onClick={handleContinue} icon={<RightOutlined />} iconPosition="end">
							Continuar
						</Button>
					</div>

					{clientId && (
						<ClientEditDrawer
							clientId={clientId}
							open={drawerOpen}
							onClose={() => setDrawerOpen(false)}
							onSaved={onClientSaved}
						/>
					)}
				</>
			)}
		</>
	);
};
