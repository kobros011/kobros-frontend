import { formatRouteMoney } from '@/infrastructure/utils/money';
import { Client } from '@/domain/Client';
import { Route } from '@/domain/Route';
import { LoanFull } from '@/domain/Loan';
import { FormInstance, Form, Button, Typography, Select, Spin, Input } from 'antd';
import { FC, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import { PrioritySelector } from '@/UI/Routes/ClientsView/priority/PrioritySelector';
import { SelectClient } from '@/UI/Components/Fields/SelectClient';
import { ClientEditDrawer } from './ClientEditDrawer';
import { FichaField } from './FichaField';
import { ClientContactsCard } from './ClientContactsCard';
import { ruleRequired } from '@/constants/rules';

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

	const handleContinue = () => {
		form.validateFields(['currentAddress', 'currentMobile']).then(onContinue, () => undefined);
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
					<FichaField label="Documento">
						{idDocument}
					</FichaField>
					{(client?.beak ?? 0) > 0 && (
						<FichaField label="Saldo a favor">
							{formatRouteMoney(client?.beak ?? 0, routeId)}
						</FichaField>
					)}

					<FichaField label="Nombre del cliente">
						<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
							<span>{fullName}</span>
							<Button size="small" type="primary" ghost icon={<RightOutlined />} iconPosition="end" onClick={() => setDrawerOpen(true)}>
								Editar cliente
							</Button>
						</div>
					</FichaField>

					<div className="loan-wizard-ref-block">
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
							<strong>Corrección rápida de entrega</strong>
							<Text type="secondary" style={{ fontSize: 12 }}>Editable directo</Text>
						</div>
						<Form.Item label="Dirección de cobro" name="currentAddress" rules={[ruleRequired]} style={{ marginBottom: 12 }} className="loan-wizard-field">
							<Input size="small" placeholder="Dirección del cliente" />
						</Form.Item>
						<Form.Item label="Celular del cliente" name="currentMobile" rules={[ruleRequired]} style={{ marginBottom: 0 }} className="loan-wizard-field">
							<Input size="small" inputMode="tel" placeholder="Celular del cliente" />
						</Form.Item>
					</div>

					{clientId && <ClientContactsCard clientId={clientId} contacts={client?.contacts} />}

					{routes.length <= 1 && (
						<FichaField label="Ruta del cliente">
							{routeNameValue || client?.routeName || routeName}
						</FichaField>
					)}

					{clientId && (
						<Form.Item name="newOrder" style={{ marginBottom: 12 }}>
							<PrioritySelector clientId={clientId} routeId={routeId} />
						</Form.Item>
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
