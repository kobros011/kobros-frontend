import routePaths from '@/constants/routePaths';
import useUserStore from '@/infrastructure/context/User/UserDataJWTStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { LoginData } from '@/infrastructure/dto/LoginDto';
import { login } from '@/infrastructure/querys/Login';
import { handleError } from '@/infrastructure/utils/handleError';
import { Alert, Button, Card, Col, Flex, Form, Image, Input, Row, theme, Typography  } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageLogin from '@assets/logo-transparent.png';

const LoginView: FC = () => {
	const [form] = Form.useForm<LoginData>();
	const setJwt = useUserStore(state => state.setJwt);
	const resetJwt = useUserStore(state => state.resetStore);
	const resetMode = useUserModeStore(state => state.resetStore);

	const { token: { colorBgContainer } } = theme.useToken();

	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

	const loginMutation = login();
	const navigate = useNavigate();

	const onFinish = (values: LoginData) => {
		void loginMutation.mutateAsync(values, {
			onSuccess(response) {
				if (response?.data) {
					setJwt(response.data);
					setErrorMessage(undefined);
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.INICIO}`);
				}
			},
			onError(error) {
				console.error(error);
				setErrorMessage(handleError(error, 'Ocurrió un error al iniciar sesión'));
			},
		});
	};

	useEffect(() => {
		void resetJwt();
		void resetMode();
	}, []);


	return (
		<Row justify={'center'} align={'middle'} style={{ minWidth: '300px', minHeight: '80vh' }}>
			<Col xs={22} sm={16} md={12} lg={8}>
				<Card
					style={{ 
						padding: '2rem',
						background: colorBgContainer,
					}}
				>
					<Flex vertical justify="center" align="center">
						<Image src={ImageLogin} width={250} preview={false} style={{ marginTop: '-120px' }} />
						<Typography.Title level={3} style={{ marginTop: '-80px' }} >¡Bienvenido!</Typography.Title>
						<Typography.Text>Para continuar inicia sesión</Typography.Text>
					</Flex>
					{errorMessage && (
						<Alert
							type="error"
							description={errorMessage}
							style={{ padding: '5px 9px', margin: '12px 0', textAlign: 'center' }}
						/>
					)}
					<Form
						form={form}
						layout="vertical"
						onFinish={(values) => onFinish(values)}
					>
						<Form.Item
							name={'username'}
							label={'Usuario'}
							rules={[{ required: true, message: 'El usuario en requerido' }]}
						>
							<Input placeholder="Ingresa tu usuario" />
						</Form.Item>
						<Form.Item
							name={'password'}
							label={'Contraseña'}
							rules={[{ required: true, message: 'La contraseña en requerida' }]}
						>
							<Input.Password  placeholder="Ingresa tu contraseña" />
						</Form.Item>
						<Button loading={loginMutation.isPending} htmlType="submit" style={{ width: '100%' }} type="primary">Ingresar</Button>
					</Form>
				</Card>
			</Col>
		</Row>
	);
};

export default LoginView;