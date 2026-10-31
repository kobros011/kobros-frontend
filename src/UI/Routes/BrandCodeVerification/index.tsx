import React, { useState } from 'react';
import { Button, Form, Input, Typography, notification } from 'antd';
import { useAuth, useClerk } from '@clerk/clerk-react';
import axios from 'axios';

const { Title, Text } = Typography;

interface BrandCodeVerificationProps {
	onVerified: () => void;
}

const BrandCodeVerification: React.FC<BrandCodeVerificationProps> = ({ onVerified }) => {
	const [loading, setLoading] = useState(false);
	const { signOut } = useClerk();
	const { getToken } = useAuth();

	const handleSubmit = async ({ code }: { code: string }) => {
		setLoading(true);
		try {
			const token = await getToken();
			await axios.post(
				'/auth/verify-brand-code',
				{ code },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			try {
				sessionStorage.setItem('brand_verified', 'true');
			} catch {
				// sessionStorage unavailable (private mode); continue anyway
			}
			onVerified();
		} catch {
			notification.error({
				message: 'Código incorrecto',
				description: 'El código de marca ingresado no es válido.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'var(--ant-color-bg-layout)',
			}}
		>
			<div style={{ width: 360, padding: '40px 32px', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', background: 'var(--ant-color-bg-container)' }}>
				<div style={{ textAlign: 'center', marginBottom: 28 }}>
					<Title level={4} style={{ marginBottom: 4 }}>Verificación de marca</Title>
					<Text type="secondary">Ingresa el código único de tu organización para continuar.</Text>
				</div>
				<Form
					onFinish={(values: { code: string }) => { void handleSubmit(values); }}
					layout="vertical"
					requiredMark={false}
				>
					<Form.Item
						name="code"
						label="Código de marca"
						rules={[{ required: true, message: 'Ingresa el código de tu marca' }]}
					>
						<Input
							size="large"
							placeholder="Ej: MARCA-001"
							autoFocus
							autoComplete="off"
						/>
					</Form.Item>
					<Form.Item style={{ marginBottom: 8 }}>
						<Button type="primary" htmlType="submit" size="large" block loading={loading}>
							Verificar
						</Button>
					</Form.Item>
					<Button
						type="link"
						size="small"
						block
						onClick={() => { void signOut(); }}
						style={{ color: 'var(--ant-color-text-secondary)' }}
					>
						Cerrar sesión
					</Button>
				</Form>
			</div>
		</div>
	);
};

export default BrandCodeVerification;
