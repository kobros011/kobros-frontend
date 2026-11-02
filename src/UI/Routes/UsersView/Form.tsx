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
import { App, Button, Card, Col, Form, Input, Result, Row, Select, Typography } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Text } = Typography;

type UserFormValues = Partial<User> & { newPassword?: string };

const FormUser: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<UserFormValues>();
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

	const applyPasswordIfNeeded = async (newPassword?: string) => {
		if (isCreate || !newPassword?.trim() || !canResetPassword || !id) {
			return;
		}
		try {
			await userRepository.setPassword(id, newPassword.trim());
			form.setFieldValue('newPassword', undefined);
			notification.success({ message: 'Contraseña actualizada' });
		} catch {
			notification.error({ message: 'No se pudo actualizar la contraseña' });
		}
	};

	const onFinish = (values: UserFormValues) => {
		const { newPassword, ...rest } = values;
		startLoading();
		userMutation.mutate({
			...user,
			...rest,
			brandId: rest.brandId ? rest.brandId : brandId,
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				void applyPasswordIfNeeded(newPassword);
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

	const [resettingPassword, setResettingPassword] = useState(false);

	const handleSendPasswordReset = async () => {
		if (!id) return;
		setResettingPassword(true);
		try {
			await userRepository.sendPasswordReset(id);
			notification.success({ message: 'Correo de restablecimiento enviado al usuario.' });
		} catch {
			notification.error({ message: 'No se pudo enviar el correo de restablecimiento.' });
		} finally {
			setResettingPassword(false);
		}
	};

	const userHasEmail = Boolean(user?.email?.trim());

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
				disabled={isRefetching || isLoading || readonly}
				onFinish={onFinish}
				preserve={false}
			>
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
							label="Tipo de usuario"
							name={'typeUser'}
							rules={[ ruleRequired ]}
						>
							<Select options={TypeUserOptions} placeholder="Tipo de usuario" />
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
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Usuario"
							name={'username'}
							rules={[ ruleRequired, ruleUsername ]}
						>
							<Input placeholder="Nombre de usuario" />
						</Form.Item>
					</Col>
					{isCreate &&
						<Col {...spanConfigForm.medium} >
							<Form.Item
								label="Contraseña"
								name={'password'}
								rules={[ ruleRequired, rulePasswordMin ]}
							>
								<Input.Password placeholder="Contraseña (mín. 8 caracteres)" />
							</Form.Item>
						</Col>
					}
					{!isCreate && canResetPassword && !readonly &&
						<Col {...spanConfigForm.medium} >
							<Form.Item
								label="Nueva contraseña"
								name="newPassword"
								rules={[
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
								<Input.Password placeholder="Dejar vacío para no cambiar" />
							</Form.Item>
						</Col>
					}
				</Row>
			</Form>

			<ActionsButton
				textAction={id ? 'Actualizar' : 'Crear'}
				hiddenSave={readonly}
				hiddenSaveAndExit={readonly}
				isLoading={isRefetching || isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={form.submit}
				onClickSaveExit={() => { form.submit(); setExit(true); }}
			/>
			{canResetPassword && id && userHasEmail && (
				<Button
					danger
					type="dashed"
					size="small"
					loading={resettingPassword}
					onClick={() => void handleSendPasswordReset()}
					style={{ marginTop: 8 }}
				>
					Enviar reset de contraseña
				</Button>
			)}
			{canResetPassword && id && !userHasEmail && (
				<Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
					Sin correo: asigne la contraseña con el campo &quot;Nueva contraseña&quot; al guardar.
				</Text>
			)}
		</Card>
	);
};

export default FormUser;