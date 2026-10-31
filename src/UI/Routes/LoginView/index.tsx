import { esES } from '@clerk/localizations';
import { SignIn } from '@clerk/clerk-react';
import { Flex, Image, Typography, theme } from 'antd';
import { useMemo } from 'react';
import Logo from '@assets/logo-transparent.png';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';

const { Text } = Typography;

const LoginView = () => {
	const { token } = theme.useToken();
	const darkMode = useUserModeStore(state => state.darkMode);

	const appearance = useMemo(
		() => ({
			variables: {
				colorPrimary: token.colorPrimary,
				colorBackground: token.colorBgContainer,
				colorInputBackground: token.colorBgContainer,
				colorText: token.colorText,
				colorTextSecondary: token.colorTextSecondary,
				colorDanger: token.colorError,
				borderRadius: `${token.borderRadius}px`,
				fontFamily: token.fontFamily,
			},
			elements: {
				rootBox: {
					width: '100%',
					maxWidth: 420,
				},
				card: {
					boxShadow: token.boxShadowSecondary,
					border: `1px solid ${token.colorBorder}`,
				},
				headerTitle: {
					display: 'none',
				},
				headerSubtitle: {
					display: 'none',
				},
				footerAction: {
					display: 'none',
				},
				formButtonPrimary: {
					backgroundColor: token.colorPrimary,
				},
			},
		}),
		[token],
	);

	return (
		<Flex
			vertical
			justify="center"
			align="center"
			gap={16}
			style={{
				minHeight: '100vh',
				padding: '24px 16px',
				background: darkMode ? '#1a1a1a' : token.colorBgLayout,
			}}
		>
			<Flex vertical align="center" style={{ marginBottom: 8 }}>
				<Image src={Logo} preview={false} width={240} alt="Kobros" />
			</Flex>
			<SignIn routing="hash" appearance={appearance} localization={esES} />
			<Text
				type="secondary"
				style={{
					fontSize: 13,
					textAlign: 'center',
					maxWidth: 380,
					lineHeight: 1.55,
					marginTop: 4,
					padding: '0 8px',
				}}
			>
				Después de iniciar sesión, si tu cuenta tiene una marca asignada, ingresa el{' '}
				<Text type="secondary" strong>
					código de seguridad
				</Text>{' '}
				que te proporcionó tu organización.
			</Text>
		</Flex>
	);
};

export default LoginView;
