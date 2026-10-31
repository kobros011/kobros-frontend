import { Button, Card, Flex, Form } from 'antd';
import { FC, useEffect } from 'react';
import BaseFormLoan from './BaseForm';
import { LoanFullRead } from '@/domain/Loan';
import { getLoanMoreInfo } from '@/infrastructure/querys/Loan';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChangeLoan } from './Hooks/useChangeDataLoan';
import { CardContentPayments } from '@/UI/Components/PaymentsDateailsLoan/CardContent';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import routePaths from '@/constants/routePaths';

const DetailsLoanView: FC = () => {
	const { id } = useParams();
	const { state } = useLocation() as { state: { clientId: string, routesIds: string[] } };
	const [form] = Form.useForm<Partial<LoanFullRead>>();
	const isMobile = useUserModeStore(store => store.isMobile);

	const navigate = useNavigate();

	const { loan, isLoading, isFetching } = getLoanMoreInfo(id);

	useEffect(() => {
		if (loan) {
			form.setFieldsValue(loan);
			useChangeLoan([{ name: ['paymentMethod'] }, { name: ['valueCapital'] }], form);
		}
	}, [loan]);

	if (isLoading || isFetching) {
		return (
			<LoadingComponent label="Cargando crédito" fullHeight />
		);
	}

	return (
		<div
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '83vh' }}
		>
			<Card
				title='Ver crédito'
			>
				<BaseFormLoan
					hasReadOnly
					disabled={true}
					form={form}
				/>

				<Flex gap={10} justify={isMobile ? 'center' : 'flex-end'}>
					<Button onClick={() => void navigate(-1)} type='primary' danger ghost>Cerrar</Button>
					<Button type='primary' onClick={() => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${routePaths.DEFAULT_CREATE}`, { replace: true, state: { clientId: state?.clientId, routeIds: state.routesIds } })}>Crear nuevo crédito</Button>
				</Flex>

			</Card>

			<Card
				title='Historial de pagos'
				style={{ marginTop: '10px' }}
			>
				<CardContentPayments loanId={id ?? ''} />
			</Card>
		</div>
	);
};

export default DetailsLoanView;