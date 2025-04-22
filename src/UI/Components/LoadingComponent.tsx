import React, { JSX } from 'react';
import { Spin, theme, Typography } from 'antd';

interface LoadingComponentProps {
	label?: string
	fullHeight?: boolean
}

const LoadingComponent = ({ label, fullHeight = false }: LoadingComponentProps): JSX.Element => {
	const { getDesignToken } = theme;

	const token = getDesignToken();
	return (
		<div style={{
			display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
			height: fullHeight ? '100vh' : '100%', gap: 24,
		}}>
			<Spin percent={'auto'} size="large"/>
			<Typography.Text style={{ color: token.colorPrimary, marginTop: '-20px' }}>{label}</Typography.Text>
		</div>
	);
};

export default LoadingComponent;