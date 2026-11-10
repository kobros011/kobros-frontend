import { FC } from 'react';
import { Alert, Form, FormInstance, Segmented, Typography } from 'antd';
import { LoanFields } from '@/UI/Routes/LoansView/components/LoanFields';
import { DashboardShell } from '@/UI/Components/Dashboard/ui';
import { CurrencyProvider } from '@/infrastructure/hooks/useMoney';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import './priority/priority.css';

const { Text } = Typography;

const isFilled = (value: unknown) => value !== undefined && value !== null && value !== '';

/** Rutas elegidas para el crédito: con una sola, esa; con varias, la que se elija en "Ruta del crédito". */
export const resolveLoanRouteId = (routeIds: string[], chosen?: string) => (routeIds.length === 1 ? routeIds[0] : routeIds.includes(chosen ?? '') ? chosen : undefined);

interface ClientLoanSectionProps {
	form: FormInstance
	/** Rutas a las que se asigna el cliente (del bloque "Rutas y prioridad"). */
	routeIds: string[]
	/** Ya se intentó guardar: se muestra el aviso si el crédito quedó a medias. */
	submitted?: boolean
}

/** Crear cliente: crédito opcional ("paso 3" del asistente) que se crea junto con el cliente en la ruta elegida. */
export const ClientLoanSection: FC<ClientLoanSectionProps> = ({ form, routeIds, submitted }) => {
	const { routes } = useRoutes();
	const loan = Form.useWatch('loan', form) as { routeId?: string, valueCapital?: unknown, valueQuotaFixed?: unknown, agreedQuotas?: unknown, paymentMethod?: unknown } | undefined;

	const routeId = resolveLoanRouteId(routeIds, loan?.routeId);
	const started = [loan?.valueCapital, loan?.valueQuotaFixed, loan?.agreedQuotas, loan?.paymentMethod].some(isFilled);
	const missing = started && [loan?.valueCapital, loan?.valueQuotaFixed, loan?.agreedQuotas, loan?.paymentMethod].some(value => !isFilled(value));
	const route = routes.find(item => item.id === routeId);
	const multiple = routeIds.length > 1;

	return (
		<CurrencyProvider routeId={routeId}>
			<DashboardShell>
				<section className="pr-card loan-wizard" aria-label="Datos del crédito" style={{ opacity: started ? 1 : 0.85, borderColor: submitted && missing ? 'var(--kb-danger, #E5484D)' : undefined }}>
					<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
						<div>
							<strong>Datos del Crédito</strong> <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-muted)' }}>(Opcional)</span>
							<div className="pr-hint" style={{ marginTop: 2 }}>
								{started ? 'El crédito se crea junto con el cliente, en la ruta elegida.' : 'Si no ingresas datos aquí, se registrará el cliente en la ruta sin crear ningún crédito inicial.'}
							</div>
						</div>
						{route && <span className="kb-mono" style={{ fontSize: 11, color: 'var(--kb-primary)' }}>{route.name}{route.currency ? ` · ${route.currency}` : ''}</span>}
					</header>

					{multiple && (
						<div className="kb-loan-compact">
							<Form.Item
								label="Ruta del crédito"
								name={['loan', 'routeId']}
								rules={[{ validator: (_, value?: string) => (!started || routeIds.includes(value ?? '') ? Promise.resolve() : Promise.reject(new Error('Elige la ruta del crédito'))) }]}
								extra={<Text type="secondary" style={{ fontSize: 12 }}>El cliente está en varias rutas: elige a cuál va el crédito.</Text>}
								className="loan-wizard-field"
							>
								<Segmented
									size="small"
									block
									options={routeIds.map(id => ({ value: id, label: routes.find(item => item.id === id)?.name ?? 'Ruta' }))}
								/>
							</Form.Item>
						</div>
					)}

					{submitted && missing && <Alert type="error" showIcon style={{ fontSize: 12 }} message="Completa capital, cuota, cuotas y forma de pago." />}

					<LoanFields form={form} prefix={['loan']} optional compact routeId={routeId} />
				</section>
			</DashboardShell>
		</CurrencyProvider>
	);
};
