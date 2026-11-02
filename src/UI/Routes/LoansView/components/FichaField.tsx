import { Typography } from 'antd';
import { FC, ReactNode } from 'react';

const { Text } = Typography;

interface FichaFieldProps {
	label: string;
	children: ReactNode;
}

export const FichaField: FC<FichaFieldProps> = ({ label, children }) => (
	<div style={{ marginBottom: 12 }}>
		<Text type="secondary" className="loan-wizard-ficha-label">
			{label}
		</Text>
		<div className="loan-wizard-ficha-value">{children}</div>
	</div>
);
