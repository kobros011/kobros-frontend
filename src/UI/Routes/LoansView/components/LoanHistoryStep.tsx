import { ClientCreditSummary } from '@components/ClientCreditSummary';
import { Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { FC } from 'react';

interface LoanHistoryStepProps {
	clientId: string;
	onContinue: () => void;
}

export const LoanHistoryStep: FC<LoanHistoryStepProps> = ({ clientId, onContinue }) => {
	const footer = (
		<div className="loan-wizard-cta-row">
			<Button size="small" type="primary" onClick={onContinue} icon={<RightOutlined />} iconPosition="end">
				Continuar
			</Button>
		</div>
	);

	return (
		<ClientCreditSummary
			clientId={clientId}
			emptyDescription="Primer crédito — sin historial previo"
			footer={footer}
		/>
	);
};
