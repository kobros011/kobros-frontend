import { spanConfigForm } from '@/constants/getSpan';
import { queryKeyClients, queryKeyDefault } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { ruleRequired } from '@/constants/rules';
import { TypeUser } from '@/constants/types';
import { Client } from '@/domain/Client';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getClient, useMutationType } from '@/infrastructure/querys/Client';
import { handleError } from '@/infrastructure/utils/handleError';
import { ClientRoutesSection } from './priority/ClientRoutesSection';
import { useCanManagePriority } from './priority/usePriorityAccess';
import ActionsButton from '@/UI/Components/AcctionButtons';
import { ClientCreditSummary } from '@components/ClientCreditSummary';
import InputDate from '@/UI/Components/Fields/InputDate';
import { SelectBrand } from '@/UI/Components/Fields/SelectBrand';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Card, Col, Divider, Form, Input, Result, Row, Typography } from 'antd';

const { Text, Title } = Typography;
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';

const FormClient: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Client>>();
	
	const { typeUser, brandId } = useUserStore(state => state.user);
	const { routes } = useRouteStore(state => state);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { client, isLoading: isLoadingClient, isRefetching, isError, error: errorClient } = getClient(id);
	const clientMutation = useMutationType(id ? 'update' : 'create');

	const [exit, setExit] = useState<boolean>(false);

	const isCreate = !id;
	const canManagePriority = useCanManagePriority();

	const isDev = typeUser == TypeUser.dev;

	const onFinish = (values: Partial<Omit<Client, 'loansNumber'>>) => {
		startLoading();
		clientMutation.mutate({
			...client,
			...values,
			brandId: values.brandId ? values.brandId : brandId,
			...(isCreate ? { routesIds: routes?.map(item => item.id) } : {}),
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				notification.success({ message: `El cliente fue ${isCreate ? 'creado' : 'actualizado'} exitosamente` });
				stopLoading();

				if (exit) {
					void queryClient.invalidateQueries({
						queryKey: [queryKeyClients.base, queryKeyDefault.list],
						exact: false,
					});
					setExit(false);
					form.resetFields();
					void navigate(-1);
					return;
				}

				if (isCreate && data) {
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.CLIENTS}/${data?.id}/editar`, { replace: true });
				}
			},
			onError: (error) => {
				stopLoading();
				notification.error({ message: handleError(error, `Ocurrió un error al ${isCreate ? 'crear' : 'actualizar'} el cliente`) });
			},
		});
	};

	if (isLoadingClient) {
		return <LoadingComponent label="Cargando cliente" fullHeight />;
	}

	if (isError) {
		const axiosError = errorClient as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorClient, 'Error al obtener el cliente')}
				subTitle={axiosError.message ?? 'Error al obtener el cliente'}
			/>
		);
	}

	return (
		<Card
			title={`${isCreate ? 'Crear' : readonly ? 'Ver' : 'Actualizar'} cliente`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Form
				form={form}
				layout="vertical"
				key={client ? `${client.id}-${client.updatedAt}` : 'new'}
				initialValues={client ? client : {}}
				disabled={isRefetching || isLoading || readonly}
				onFinish={onFinish}
			>
				<Row gutter={[16, 0]}>
					{(isDev) &&
						<Col {...spanConfigForm.medium}>
							<Form.Item
								label="Marca"
								name={'brandId'}
								rules={[ ruleRequired ]}
							>
								<SelectBrand disabled={!isCreate} />
							</Form.Item>
						</Col>
					}
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Nombre completo"
							name={'fullName'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Nombre completo del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Documento (Cédula, DNI)"
							name={'idDocument'}
							rules={[ ruleRequired ]}
						>
							<Input inputMode="numeric" placeholder="Documento del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Celular"
							name={'currentMobile'}
							rules={[ ruleRequired ]}
						>
							<Input inputMode="tel" placeholder="Celular del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Dirección"
							name={'currentAddress'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Dirección del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Barrio"
							name={'neighborhood'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Barrio del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Teléfono"
							name={'currentPhone'}
						>
							<Input inputMode="tel" placeholder="Teléfono del cliente" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Fecha vinculación"
							name={'linkingDate'}
							rules={[ ruleRequired ]}
						>
							<InputDate useCurrentDate disabled={!isCreate} placeholder="Fecha vinculación del cliente" />
						</Form.Item>
					</Col>

					{/* Sección Fiador */}
					<Col xs={24}>
						<Divider orientation="left" style={{ marginTop: 8, marginBottom: 4 }}>
							<Text type="secondary" style={{ fontSize: 13 }}>Datos del fiador (opcional)</Text>
						</Divider>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item label="Nombre del fiador" name={'guarantorName'}>
							<Input placeholder="Nombre completo del fiador" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item label="Cédula del fiador" name={'guarantorCedula'}>
							<Input inputMode="numeric" placeholder="Cédula del fiador" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item label="Teléfono del fiador" name={'guarantorPhone'}>
							<Input inputMode="tel" placeholder="Teléfono del fiador" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item label="Dirección del fiador" name={'guarantorAddress'}>
							<Input placeholder="Dirección del fiador" />
						</Form.Item>
					</Col>

					{/* Sección Referencias — máx. 2, bloques fijos */}
					{[0, 1].map((idx) => (
						<Col xs={24} key={idx}>
							<Divider orientation="left" style={{ marginTop: 8, marginBottom: 4 }}>
								<Text type="secondary" style={{ fontSize: 13 }}>Referencia {idx + 1} (opcional)</Text>
							</Divider>
							<Row gutter={[16, 0]}>
								<Col {...spanConfigForm.medium}>
									<Form.Item
										label="Nombre"
										name={['references', idx, 'name']}
										dependencies={[['references', idx, 'phone'], ['references', idx, 'address']]}
										rules={[({ getFieldValue }) => ({
											required: !!(getFieldValue(['references', idx, 'phone']) || getFieldValue(['references', idx, 'address'])),
											message: 'Ingresa el nombre de la referencia',
										})]}
									>
										<Input placeholder={`Nombre referencia ${idx + 1}`} />
									</Form.Item>
								</Col>
								<Col {...spanConfigForm.medium}>
									<Form.Item label="Teléfono" name={['references', idx, 'phone']}>
										<Input inputMode="tel" placeholder={`Teléfono referencia ${idx + 1}`} />
									</Form.Item>
								</Col>
								<Col {...spanConfigForm.medium}>
									<Form.Item label="Dirección" name={['references', idx, 'address']}>
										<Input placeholder={`Dirección referencia ${idx + 1}`} />
									</Form.Item>
								</Col>
							</Row>
						</Col>
					))}
				</Row>
			</Form>

			{id && client && <ClientRoutesSection client={client} canManage={canManagePriority} readonly={readonly} />}

			{id && (
				<>
					<Divider style={{ marginTop: 8 }} />
					<Title level={5} style={{ marginBottom: 12 }}>
						Historial de créditos
					</Title>
					<ClientCreditSummary clientId={id} />
				</>
			)}

			<ActionsButton
				textAction={id ? 'Actualizar' : 'Crear'}
				hiddenSave={readonly}
				hiddenSaveAndExit={readonly}
				isLoading={isRefetching || isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={form.submit}
				onClickSaveExit={() => { form.submit(); setExit(true); }}
			/>
		</Card>
	);
};

export default FormClient;