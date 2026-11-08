import { Button, Card, Collapse, CollapseProps, Flex, Result, Tag } from 'antd';
import { FC } from 'react';
import { getLoanMoreInfo } from '@/infrastructure/querys/Loan';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PaymentsHistory } from '@/UI/Components/PaymentsDateailsLoan/PaymentsHistory';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import routePaths from '@/constants/routePaths';
import { PaymentMethod } from '@/constants/types';
import { formatNumber } from '@/infrastructure/utils/formaNumber';
import { handleError } from '@/infrastructure/utils/handleError';
import { spanConfigForm } from '@/constants/getSpan';
import { Col, Row, Typography } from 'antd';
import dayjs from 'dayjs';
import { StepHeader } from './components/StepHeader';
import { computeLoanDerived } from './Hooks/useChangeDataLoan';
import { LoanWizardShell } from './components/LoanWizardShell';
import { FichaField } from './components/FichaField';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';

const { Text } = Typography;

const SummaryRow: FC<{ label: string; value: string; danger?: boolean; bold?: boolean }> = ({
	label,
	value,
	danger,
	bold,
}) => (
	<div className="loan-wizard-summary-row">
		<Text type={danger ? 'danger' : 'secondary'} style={{ fontSize: bold ? 14 : 13 }} strong={bold}>
			{label}
		</Text>
		<Text strong={bold} style={{ fontVariantNumeric: 'tabular-nums' }}>
			{value}
		</Text>
	</div>
);

const DetailsLoanView: FC = () => {
	const { id } = useParams();
	const { state } = useLocation() as { state?: { clientId?: string; routesIds?: string[] } };
	const isMobile = useUserModeStore(store => store.isMobile);
	const navigate = useNavigate();

	const { loan, isLoading, isError, error } = getLoanMoreInfo(id);

	if (isLoading && !loan) {
		return <LoadingComponent label="Cargando crédito" fullHeight />;
	}

	if (isError) {
		const axiosError = error as AxiosError;
		return (
			<Result
				status={(axiosError.status as ExceptionStatusType) ?? 500}
				title={handleError(error, 'Error al obtener la información del crédito')}
				subTitle={axiosError.message ?? 'Error al obtener la información del crédito'}
			/>
		);
	}

	if (!loan) {
		return (
			<Result
				status="404"
				title="Crédito no encontrado"
				subTitle="No se encontró información para este crédito."
			/>
		);
	}

	const isFixedDate = loan.paymentMethod === PaymentMethod.fixedDate;
	const term = computeLoanDerived({
		agreedQuotas: loan.agreedQuotas,
		valueCapital: loan.valueCapital,
		valueQuotaFixed: loan.valueQuotaFixed,
		paymentMethod: loan.paymentMethod,
		dateFirstQuota: loan.dateFirstQuota,
	}).daysLoan;

	const createLoanState = {
		clientId: state?.clientId ?? loan.clientId,
		routeIds: state?.routesIds ?? (loan.routeId ? [loan.routeId] : undefined),
	};

	const collapseItems: CollapseProps['items'] = [
		{
			key: 'client',
			label: <StepHeader n={1} title="Info del Cliente" done active />,
			children: (
				<>
					<FichaField label="Cédula del cliente (DNI)">{loan.idDocument}</FichaField>
					<FichaField label="Nombre del cliente">{loan.fullName}</FichaField>
					<FichaField label="Dirección">{loan.currentAddress}</FichaField>
					<FichaField label="Celular">{loan.currentMobile}</FichaField>
					<FichaField label="Ruta del cliente">{loan.routeName}</FichaField>
				</>
			),
		},
		{
			key: 'data',
			label: (
				<span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
					<StepHeader n={2} title="Datos del Crédito" done active />
					{loan.loanNumber != null && (
						<Tag color="blue" style={{ fontSize: 10 }}>Crédito #{loan.loanNumber}</Tag>
					)}
					<Tag color={(loan.pendingQuotas ?? 0) > 0 ? 'warning' : 'success'} style={{ fontSize: 10 }}>
						{(loan.pendingQuotas ?? 0) > 0 ? 'Activo' : 'Cancelado'}
					</Tag>
				</span>
			),
			children: (
				<>
					<Row gutter={[12, 0]}>
						<Col {...spanConfigForm.large}>
							<FichaField label="Valor capital">${formatNumber(loan.valueCapital)}</FichaField>
						</Col>
						<Col {...spanConfigForm.large}>
							<FichaField label="Valor cuota fija">${formatNumber(loan.valueQuotaFixed)}</FichaField>
						</Col>
						<Col {...spanConfigForm.large}>
							<FichaField label="Cuotas pactadas">{loan.agreedQuotas}</FichaField>
						</Col>
						<Col {...spanConfigForm.large}>
							<FichaField label="Forma de pago">{loan.paymentMethod}</FichaField>
						</Col>
					</Row>

					{isFixedDate && (
						<FichaField label="Día del mes">{loan.fixedPaymentDay}</FichaField>
					)}

					<Row gutter={[12, 0]}>
						<Col {...spanConfigForm.large}>
							<FichaField label="Fecha inicio">
								{loan.initialDate ? dayjs(loan.initialDate).format('DD/MM/YYYY') : '—'}
							</FichaField>
						</Col>
						<Col {...spanConfigForm.large}>
							<FichaField label="Fecha fin">
								{loan.endDate ? dayjs(loan.endDate).format('DD/MM/YYYY') : '—'}
							</FichaField>
						</Col>
					</Row>

					<div className="loan-wizard-summary-panel" style={{ marginTop: 16 }}>
						<Text strong style={{ display: 'block', marginBottom: 8 }}>Resumen calculado</Text>
						<SummaryRow label="Capital prestado" value={`$${formatNumber(loan.valueCapital)}`} />
						<SummaryRow label="Utilidad" value={`$${formatNumber(loan.valueUtilityLoan)}`} />
						<SummaryRow label="Total del crédito" value={`$${formatNumber(loan.valueTotalLoan)}`} />
						<SummaryRow label="Plazo del préstamo" value={term || '—'} />
						<SummaryRow label="Tasa de interés" value={`${formatNumber(loan.interestRate, 4)}%`} />
						<SummaryRow label="Cuotas canceladas" value={String(loan.canceledQuotas ?? 0)} />
						<SummaryRow label="Cuotas pendientes" value={String(loan.pendingQuotas ?? 0)} />
						{Number(loan.totalDefault ?? 0) > 0 && (
							<SummaryRow label="Total en mora" value={`$${formatNumber(loan.totalDefault)}`} danger />
						)}
						<SummaryRow label="Pagado" value={`$${formatNumber(String(loan.paid ?? 0))}`} />
						<SummaryRow label="Saldo pendiente" value={`$${formatNumber(String(loan.balance ?? 0))}`} bold />
					</div>
				</>
			),
		},
		{
			key: 'payments',
			label: <StepHeader n={3} title="Historial de Pagos" done active />,
			children: (
				<div className="loan-wizard-loan-card" style={{ padding: 0, border: 'none' }}>
					<PaymentsHistory loanId={id ?? ''} />
				</div>
			),
		},
	];

	return (
		<div style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '83vh' }}>
			<Card title="Ver crédito">
				<LoanWizardShell>
					<Collapse defaultActiveKey={['client', 'data', 'payments']} items={collapseItems} />
				</LoanWizardShell>

				<Flex gap={10} justify={isMobile ? 'center' : 'flex-end'} style={{ marginTop: 16 }}>
					<Button onClick={() => void navigate(-1)} type="primary" danger ghost>
						Cerrar
					</Button>
					<Button
						type="primary"
						disabled={!createLoanState.clientId || !createLoanState.routeIds?.length}
						onClick={() =>
							void navigate(
								`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${routePaths.DEFAULT_CREATE}`,
								{ replace: true, state: createLoanState },
							)
						}
					>
						Crear nuevo crédito
					</Button>
				</Flex>
			</Card>
		</div>
	);
};

export default DetailsLoanView;
