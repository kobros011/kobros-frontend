import { getListPaymentsBasic } from '@/infrastructure/querys/Payment';
import { Empty, Result, Row, Spin } from 'antd';
import { FC } from 'react';
import { ItemPaymentDetail } from './Item';

export const CardContentPayments: FC<{ loanId: string }> = ({ loanId }) => {
	const { payments, isLoading, isError } = getListPaymentsBasic(loanId);

	if (isLoading && !payments) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
				<Spin tip="Cargando pagos…" />
			</div>
		);
	}

	if (isError) {
		return (
			<Result
				status="error"
				title="No se pudo cargar el historial de pagos"
				subTitle="Intenta cerrar y volver a abrir el crédito."
			/>
		);
	}

	if (!payments?.length) {
		return <Empty description="Este crédito aún no tiene pagos registrados" />;
	}

	return (
		<Row gutter={[18, 12]}>
			{payments.map(payment => (
				<ItemPaymentDetail key={payment.id} payment={payment} />
			))}
		</Row>
	);
};
