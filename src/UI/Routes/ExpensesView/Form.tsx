import { queryKeyExpenses } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { Expense } from '@/domain/Expenses';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getExpense, useMutationType } from '@/infrastructure/querys/Expense';
import { handleError } from '@/infrastructure/utils/handleError';
import { getPermission } from '@/infrastructure/utils/Permissions';
import ActionsButton from '@/UI/Components/AcctionButtons';
import InputDate from '@/UI/Components/Fields/InputDate';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { SelectConcept } from '@/UI/Components/Fields/SelectConcept';
import { SelectRoute } from '@/UI/Components/Fields/SelectRoute';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Card, Col, Form, Input, Result, Row } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { Dayjs } from 'dayjs';
import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const FormExpenses: FC<{ readonly?: boolean }> = ({ readonly: readonlyProp }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Expense>>();

	const { fullName, typeUser } = useUserStore(state => state.user);
	const { hasManageExpenses } = getPermission(typeUser);

	const { startLoading, stopLoading, isLoading } = useLoading();
	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [exit, setExit] = useState<boolean>(false);

	const isCreate = !id;
	// Quien no gestiona gastos (recaudador) puede registrar, pero no editar uno existente.
	const readonly = readonlyProp || (!isCreate && !hasManageExpenses);

	const { expense, isLoading: isLoadingExpense, isRefetching, isError, error: errorExpense } = getExpense(id);

	const mutationExpense = useMutationType(isCreate ? 'create' : 'update');

	const onFinish = (values: Partial<Expense>) => {
		startLoading();
		mutationExpense.mutate({
			...expense,
			...values,
			date: typeof values.date === 'string' ? values.date : (values?.date as unknown as Dayjs).format?.('YYYY-MM-DD'),
			...(isCreate ? { userGenerated: fullName } : {}),
		}, {
			onSuccess: (response) => {
				notification.success({ message: `Gasto ${isCreate ? 'creado' : 'actualizado'} exitosamente` });
				stopLoading();

				void queryClient.invalidateQueries({ queryKey: [queryKeyExpenses.base], exact: false });

				if (isCreate && !exit) {
					const createdPath = `/${routePaths.DEFAULT_HOME}/${routePaths.EXPENSES}/${response?.data?.id}`;
					void navigate(hasManageExpenses ? `${createdPath}/editar` : createdPath, { replace: true });
				}

				if (exit) {
					setExit(false);
					form.resetFields();
					void navigate(-1);
				}
			},
			onError: (error) => {
				stopLoading();
				setExit(false);
				notification.error({ message: handleError(error, `Ocurrió un error al ${isCreate ? 'crear' : 'actualizar'} el gasto`) });
			},
		});
	};

	if (isLoadingExpense) {
		return <LoadingComponent label="Cargando gasto" fullHeight />;
	}

	if (isError) {
		const axiosError = errorExpense as AxiosError;

		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorExpense, 'Ocurrió un error al obtener el gasto')}
				subTitle={axiosError.message ?? 'Error al obtener el gasto'}
			/>
		);
	}

	return (
		<Card
			title={`${isCreate ? 'Registrar' : readonly ? 'Ver' : 'Actualizar'} gasto`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Form
				layout="vertical"
				form={form}
				onFinish={onFinish}
				disabled={readonly || isLoading || isRefetching}
				initialValues={expense}
			>
				<Row gutter={10}>
					<Col xs={24} md={8}>
						<Form.Item
							label="Fecha del gasto"
							name={'date'}
							rules={[{ required: true, message: 'La fecha es requerida' }]}
						>
							<InputDate allowClear={false} disabled useCurrentDate />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item
							label="Ruta del gasto"
							name={'routeId'}
							rules={[{ required: true, message: 'La ruta es requerida' }]}
						>
							<SelectRoute disabled={isLoading || isRefetching || readonly} placeholder="Seleccione una ruta" />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item
							label="Valor del gasto"
							name={'value'}
							rules={[{ required: true, message: 'El valor es requerido' }]}
						>
							<InputNumber placeholder="Ingrese el valor" thousandsSeparator />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item
							label="Nombre del gasto"
							name={'name'}
							rules={[{ required: true, message: 'El nombre es requerido' }]}
						>
							<Input placeholder="Ingrese el nombre" />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item
							label="Concepto del gasto"
							name={'expensesConceptId'}
							rules={[{ required: true, message: 'El concepto es requerido' }]}
						>
							<SelectConcept readonly={readonly} />
						</Form.Item>
					</Col>
				</Row>
			</Form>

			<ActionsButton
				textAction={isCreate ? 'Registrar' : 'Actualizar'}
				hiddenSave={readonly}
				hiddenSaveAndExit={readonly}
				isLoading={isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={form.submit}
				onClickSaveExit={() => { form.submit(); setExit(true); }}
			/>
		</Card>
	);
};

export default FormExpenses;