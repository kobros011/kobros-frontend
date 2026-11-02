import { ConfigProvider, theme } from 'antd';
import { FC, ReactNode } from 'react';

interface CollectionTodayShellProps {
	children: ReactNode;
}

/** Tema compacto solo para Cobro del día (móvil recaudador). */
export const CollectionTodayShell: FC<CollectionTodayShellProps> = ({ children }) => {
	const { token } = theme.useToken();

	return (
		<ConfigProvider
			theme={{
				components: {
					Button: {
						controlHeight: 28,
						paddingInline: 8,
						contentFontSize: 12,
					},
					Select: {
						controlHeight: 28,
						fontSize: 12,
					},
					DatePicker: {
						controlHeight: 28,
						fontSize: 12,
						paddingInline: 8,
					},
					InputNumber: {
						controlHeight: 28,
						fontSize: 12,
					},
					Tag: {
						fontSizeSM: 10,
					},
					Card: {
						paddingLG: 8,
					},
				},
				token: {
					fontSize: 12,
					paddingXS: 4,
					paddingSM: 6,
					marginXS: 4,
				},
			}}
		>
			<div style={{ ['--ct-primary' as string]: token.colorPrimary }}>{children}</div>
		</ConfigProvider>
	);
};
