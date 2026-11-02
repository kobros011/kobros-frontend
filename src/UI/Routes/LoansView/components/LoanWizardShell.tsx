import { ConfigProvider, theme } from 'antd';
import { CSSProperties, FC, ReactNode } from 'react';
import '../loanWizard.css';

interface LoanWizardShellProps {
	children: ReactNode;
}

export const LoanWizardShell: FC<LoanWizardShellProps> = ({ children }) => {
	const { token } = theme.useToken();

	const cssVars: CSSProperties = {
		['--loan-primary' as string]: token.colorPrimary,
		['--loan-bg' as string]: token.colorBgContainer,
		['--loan-border' as string]: token.colorBorder,
	};

	return (
		<ConfigProvider
			theme={{
				token: {
					borderRadius: 4,
					fontSize: 13,
				},
				components: {
					Collapse: {
						headerBg: 'transparent',
						contentPadding: 10,
					},
					Form: {
						itemMarginBottom: 8,
						verticalLabelPadding: '0 0 2px',
					},
					Input: {
						controlHeight: 28,
						paddingBlock: 2,
						paddingInline: 8,
					},
					InputNumber: {
						controlHeight: 28,
						paddingBlock: 0,
						paddingInline: 6,
					},
					Select: {
						controlHeight: 28,
					},
					Button: {
						controlHeight: 28,
						controlHeightSM: 28,
						paddingInline: 10,
						contentFontSize: 13,
					},
					DatePicker: {
						controlHeight: 28,
						paddingInline: 8,
					},
				},
			}}
		>
			<div className="loan-wizard" style={cssVars}>
				{children}
			</div>
		</ConfigProvider>
	);
};
