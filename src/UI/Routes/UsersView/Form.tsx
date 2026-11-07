import { spanConfigForm } from '@/constants/getSpan';
import { TypeUserOptions } from '@/constants/OptionsSelects';
import { queryKeyUsers, queryKeyDefault } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { ruleEmailOptional, rulePasswordMin, ruleRequired, ruleUsername } from '@/constants/rules';
import { TypeUser } from '@/constants/types';
import { User } from '@/domain/User';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useUsersStore from '@/infrastructure/context/UsersStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getUser, useMutationType } from '@/infrastructure/querys/User';
import { repository as userRepository } from '@/infrastructure/repositories/User';
import { normalizeTypeUser } from '@/infrastructure/utils/defaultHomeRoute';
import { handleError } from '@/infrastructure/utils/handleError';
import ActionsButton from '@/UI/Components/AcctionButtons';
import InputDate from '@/UI/Components/Fields/InputDate';
import { SelectBrand } from '@/UI/Components/Fields/SelectBrand';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Col, Divider, Form, Input, Result, Row, Select, Typography } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Text } = Typography;

type UserFormValues = Partial<User>;
type PasswordFormValues = { newPassword: string; confirmPassword: string };

const FormUser: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<UserFormValues>();
	const [passwordForm] = Form.useForm<PasswordFormValues>();
	const resetUsersStore = useUsersStore(state => state.resetStore);

	const { typeUser: typeUserLogin, brandId } = useUserStore(state => state.user);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { user, isLoading: isLoadingUser, isRefetching, isError, refetch, error: errorUser } = getUser(id);
	const userMutation = useMutationType(id ? 'update' : 'create');

	const [exit, setExit] = useState<boolean>(false);

	const isCreate = !id;
	const role = normalizeTypeUser(typeUserLogin) ?? TypeUser.collector;
	const isSuperUser = role === TypeUser.dev;
	const canResetPassword = role === TypeUser.dev || role === TypeUser.super;

	const [changingPassword, setChangingPassword] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const handleCancelChangePassword = () => {
		passwordForm.resetFields();
		setChangingPassword(false);
	};

	const handleChangePassword = async (values: PasswordFormValues) => {
		if (!id) return;
		setSavingPassword(true);
		try {
			await userRepository.setPassword(id, values.newPassword.trim());
			notification.success({ message: 'Contraseña actualizada' });
			passwordForm.resetFields();
			setChangingPassword(false);
		} catch (err) {
			notification.error({ message: (err as Error)?.message ?? 'No se pudo actualizar la contraseña' });
		} finally {
			setSavingPassword(false);
		}
	};

	const onFinish = (values: UserFormValues) => {
		startLoading();
		userMutation.mutate({
			...user,
			...values,
			brandId: values.brandId ? values.brandId : brandId,
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				notification.success({ message: `El usuario fue ${isCreate ? 'creado' : 'actualizado'} exitosamente` });
				void resetUsersStore();

				if (!isCreate) {
					void refetch();
				}

				stopLoading();

				if (exit) {
					setExit(false);
					void queryClient.invalidateQueries({
						queryKey: [queryKeyUsers.base, queryKeyDefault.list],
					});
					void navigate(-1);
					return;
				}

				if (isCreate && data) {
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.USERS}/${data?.id}/editar`, { replace: true });
				}
			},
			onError: (error) => {
				stopLoading();
				notification.error({ message: error?.message ?? `Ocurrió un error al ${isCreate ? 'crear' : 'actualizar'} el usuario` });
			},
		});
	};

	if (isLoadingUser) {
		return <LoadingComponent label="Cargando usuario" fullHeight />;
	}

	if (isError) {
		const axiosError = errorUser as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorUser, 'Error al obtener el usuario')}
				subTitle={axiosError.message ?? 'Error al obtener el usuario'}
			/>
		);
	}

	return (
		<Card
			title={`${isCreate ? 'Crear' : readonly ? 'Ver' : 'Actualizar'} usuario`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={user}
				disabled={isRefetching || isLoading || readonly || changingPassword}
				onFinish={onFinish}
				preserve={false}
			>
				<Divider orientation="left" orientationMargin={0} style={{ marginTop: 0 }}>
					<Typography.Text type="secondary">Datos personales</Typography.Text>
				</Divider>

				<Row gutter={[16, 0]}>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Nombre completo"
							name={'fullName'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Nombre completo del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Documento(Cédula, DNI)"
							name={'documentId'}
							rules={[ ruleRequired ]}
						>
							<Input inputMode="numeric" placeholder="Documento del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Fecha vinculación"
							name={'linkingDate'}
							rules={[ ruleRequired ]}
						>
							<InputDate placeholder="Fecha de vinculación del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Dirección"
							name={'address'}
						>
							<Input placeholder="Dirección del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Teléfono"
							name={'phone'}
						>
							<Input inputMode="tel" placeholder="Teléfono del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Teléfono móvil"
							name={'mobile'}
						>
							<Input inputMode="tel" placeholder="Teléfono móvil del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Ciudad"
							name={'city'}
						>
							<Input placeholder="Ciudad del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Departamento"
							name={'department'}
						>
							<Input placeholder="Departamento del usuario" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Correo"
							name="email"
							rules={[ ruleEmailOptional ]}
						>
							<Input type="email" placeholder="Correo (opcional)" />
						</Form.Item>
					</Col>
				</Row>

				<Divider orientation="left" orientationMargin={0}>
					<Typography.Text type="secondary">Asignación</Typography.Text>
				</Divider>

				<Row gutter={[16, 0]}>
					{isSuperUser && <Col {...spanConfigForm.medium}>
						<Form.Item
							label="Marca"
							name='brandId'
							rules={[ ruleRequired ]}
						>
							<SelectBrand  disabled={readonly || !isCreate} placeholder={'Marca de la usuario'} />
						</Form.Item>
					</Col>}
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Tipo de usuario"
							name={'typeUser'}
							rules={[ ruleRequired ]}
						>
							<Select options={TypeUserOptions} placeholder="Tipo de usuario" />
						</Form.Item>
					</Col>
				</Row>

				<Divider orientation="left" orientationMargin={0}>
					<Typography.Text type="secondary">Acceso</Typography.Text>
				</Divider>

				<Row gutter={[16, 0]} align="bottom">
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Usuario"
							name={'username'}
							rules={[ ruleRequired, ruleUsername ]}
						>
							<Input placeholder="Nombre de usuario" />
						</Form.Item>
					</Col>
					{!isCreate && canResetPassword && !readonly && !changingPassword && (
						<Col>
							<Form.Item label=" ">
								<Button type="primary" ghost onClick={() => setChangingPassword(true)}>
									Cambiar contraseña
								</Button>
							</Form.Item>
						</Col>
					)}
					{isCreate &&
						<Col {...spanConfigForm.medium} >
							<Form.Item
								label="Contraseña"
								name={'password'}
								rules={[ ruleRequired, rulePasswordMin ]}
								extra={<Text type="secondary" style={{ fontSize: 12 }}>Mínimo 8 caracteres.</Text>}
							>
								<Input.Password placeholder="Contraseña (mín. 8 caracteres)" />
							</Form.Item>
						</Col>
					}
				</Row>
			</Form>

			{!isCreate && canResetPassword && !readonly && changingPassword && (
				<Form
					form={passwordForm}
					layout="vertical"
					onFinish={(values) => void handleChangePassword(values)}
				>
					<Row gutter={[16, 0]}>
						<Col {...spanConfigForm.medium}>
							<Form.Item
								label="Nueva contraseña"
								name="newPassword"
								rules={[
									ruleRequired,
									{
										validator: (_, value) => {
											if (!value || String(value).length >= 8) {
												return Promise.resolve();
											}
											return Promise.reject(new Error('La contraseña debe tener al menos 8 caracteres'));
										},
									},
								]}
							>
								<Input.Password placeholder="Nueva contraseña (mín. 8 caracteres)" />
							</Form.Item>
						</Col>
						<Col {...spanConfigForm.medium}>
							<Form.Item
								label="Confirmar contraseña"
								name="confirmPassword"
								dependencies={['newPassword']}
								rules={[
									ruleRequired,
									({ getFieldValue }) => ({
										validator: (_, value) => {
											if (!value || getFieldValue('newPassword') === value) {
												return Promise.resolve();
											}
											return Promise.reject(new Error('Las contraseñas no coinciden'));
										},
									}),
								]}
							>
								<Input.Password placeholder="Confirmar contraseña" />
							</Form.Item>
						</Col>
					</Row>
					<div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
						<Button danger onClick={handleCancelChangePassword} disabled={savingPassword}>
							Cancelar
						</Button>
						<Button type="primary" loading={savingPassword} onClick={() => passwordForm.submit()}>
							Cambiar contraseña
						</Button>
					</div>
				</Form>
			)}

			{!changingPassword && (
				<ActionsButton
					textAction={id ? 'Actualizar' : 'Crear'}
					hiddenSave={readonly}
					hiddenSaveAndExit={readonly}
					isLoading={isRefetching || isLoading}
					onClickCancel={() => void navigate(-1)}
					onClickSave={form.submit}
					onClickSaveExit={() => { form.submit(); setExit(true); }}
				/>
			)}

		</Card>
	);
};

export default FormUser;
