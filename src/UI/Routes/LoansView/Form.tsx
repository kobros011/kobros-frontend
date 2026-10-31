import { PaymentMethod } from '@/constants/types';
import { Route } from '@/domain/Route';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getClientMoreInfo } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import ActionsButton from '@/UI/Components/AcctionButtons';
import { App, Card, Form, Select } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { Result } from 'antd/lib';
import { AxiosError } from 'axios';
import { FC, useEffect, useState } from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import { useChangeLoan } from './Hooks/useChangeDataLoan';
import { nameRequiredFilesLoan, nameRequiredFilesLoanMessage } from '@/constants/requieredFiles';
import { useMutationType } from '@/infrastructure/querys/Loan';
import { useClientRoutes } from '@/infrastructure/hooks/useClientRoute';
import { LoanFull } from '@/domain/Loan';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import type { FieldData } from 'rc-field-form/lib/interface';
import BaseFormLoan from './BaseForm';
import { SelectClient } from '@/UI/Components/Fields/SelectClient';

const FormLoan: FC = () => {
	const { state } = useLocation() as { state: { clientId: string, routeIds: string[] } };
	const { clientId, routeIds } = state;

	const [form] = Form.useForm<Partial<LoanFull>>();
	const { routes, resetStore } = useRouteStore(store => store);
	const getRoute = useRouteStore(store => store.getRoute);
	
	const [availableRoute, setAvailableRoute] = useState<Route | undefined>(routes.length == 1 ? routes[0] : (routeIds?.length >= 2 || routeIds?.length == 0) ? undefined : routes?.find(item => item.id === routeIds?.[0]));
	const [availableClientId, setAvailableClientId] = useState<string | undefined>(clientId);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const { startLoading, stopLoading, isLoading } = useLoading();
	
	const { client, isLoading: isLoadingClient, isError: isErrorClient, error: errorClient, refetch } = getClientMoreInfo(availableClientId, availableRoute?.id);
	const { clientRoutes, getClientRoutes } = useClientRoutes(availableRoute?.id);
	const loanMutation = useMutationType('create');

	const saveLoan = (values: Partial<LoanFull>) => { 
		loanMutation.mutate({
			...values,
			clientrouteId: clientRoutes.find(item => item.clientId == client?.id)?.id,
			clientId: client?.id,
		}, {
			onSuccess: () => {
				notification.success({ message: 'El crédito fue creado exitosamente' });
				void refetch;
				void resetStore();
				void navigate(-1);
				stopLoading();
				form.resetFields();
				return;
			}, 
			onError: (error) => {
				stopLoading();
				notification.error({ message: error?.message ?? 'Ocurrió un error al crear el crédito' });
			},
		});
		stopLoading();
	};

	const onFinish = (values: Partial<LoanFull>) => {
		const keysValues = Object.keys(values) as Array<keyof LoanFull>;
		const emptyValuesKeys = keysValues.filter(key => { const v = values[key]; return v === '' || v === undefined || v === null || v === 0; });

		if (emptyValuesKeys.some(key => nameRequiredFilesLoan.includes(key))) {
			notification.error({ message: nameRequiredFilesLoanMessage.find(item => emptyValuesKeys.includes(item.key))?.message });
			return;
		}

		startLoading();

		getRoute(availableRoute?.id ?? '').then((response) => {
			if (values.loanNumber != (response?.loansNumber ?? 0) + 1) {
				setAvailableRoute(response);
				form.setFieldValue('loanNumber', Number(response?.loansNumber) + 1 );
				notification.info({ message: `Crédito No. modificado de ${values.loanNumber} a ${Number(response?.loansNumber) + 1}` });
			}
		}).catch(() => {
			stopLoading();
			notification.error({ message: 'Error al actualizar el numero de crédito' });
		},
		).finally(() => {
			saveLoan({ ...values, loanNumber: form.getFieldValue('loanNumber') as number });
		});
	};

	const getInitialValues = () => {
		if (client) {
			return {
				idDocument: client.idDocument,
				fullName: client.fullName,
				currentMobile: client.currentMobile,
				currentAddress: client.currentAddress,
				routeName: client.routeName,
				order: client.order,
				loanNumber: (availableRoute?.loansNumber ?? 0) + 1,
				paymentMethod: PaymentMethod.diary,
				agreedQuotas: 1,
				valueCapital: 0,
				valueQuotaFixed: 0,
				valueUtilityLoan: 0,
				valueTotalLoan: 0,
				interestRate: 0,
			};
		}

		return { paymentMethod: PaymentMethod.diary, agreedQuotas: 1 };
	};
	
	useEffect(() => {
		form.setFieldsValue(getInitialValues() as Partial<LoanFull>);
	}, [client]);

	if (isLoadingClient) {
		return <LoadingComponent label="Cargando información del cliente y la ruta" fullHeight />;
	}

	if (isErrorClient) {
		const axiosError = errorClient as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorClient, 'Error al obtener la información del cliente')}
				subTitle={axiosError.message ?? 'Error al obtener la información del cliente'}
			/>
		);
	}

	if ((!availableRoute && routeIds?.length >= 2) || !availableClientId) {
		return (
			<>
				<Select
					style={{ width: '100%', padding: 2 }}
					placeholder={'Selecciona la ruta'}
					options={routes.filter(item => routeIds?.includes(item.id))?.map(item => ({ label: item.name, value: item.id }))}
					onSelect={(value: string) => {setAvailableRoute(routes.find(item => item.id == value)); void getClientRoutes(value);}}
				/>

				{availableRoute && !availableClientId && (
					<SelectClient
						showRouteSearch
						popupMatchSelectWidth={false}
						style={{ width: '100%', padding: 2, marginTop: 8 }}
						placeholder="Seleccione un cliente"
						onSelect={(_, option) => setAvailableClientId(option?.data.id)}
					/>
				)}
			</>
		);
	}

	return (
		<Card
			title={'Crear crédito'}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<BaseFormLoan
				disabled={isLoading}
				form={form}
				getInitialValues={getInitialValues}
				onFinish={onFinish}
				clientId={clientId}
				routeId={availableRoute?.id}
				onFieldsChange={(changedFields: FieldData<LoanFull>[]) => useChangeLoan(changedFields, form)}
			/>

			<ActionsButton
				textAction={'Crear'}
				hiddenSave={true}
				isLoading={isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={() => {}}
				onClickSaveExit={() => form.submit()}
			/>
		</Card>
	);
};

export default FormLoan;