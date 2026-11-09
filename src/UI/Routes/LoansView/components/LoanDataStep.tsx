import { LoanFull } from '@/domain/Loan';
import { Button, FormInstance } from 'antd';
import { FC } from 'react';
import { LoanFields } from './LoanFields';

interface LoanDataStepProps {
	form: FormInstance<Partial<LoanFull>>;
	disabled?: boolean;
	onCancel: () => void;
	onSave: () => void;
	isLoading?: boolean;
}

/** Paso 3 del asistente de crédito: los campos del crédito (`LoanFields`) más Cancelar / Guardar. */
export const LoanDataStep: FC<LoanDataStepProps> = ({ form, disabled, onCancel, onSave, isLoading }) => (
	<>
		<LoanFields form={form as FormInstance} disabled={disabled} compact />
		<div className="loan-wizard-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
			<Button size="small" onClick={onCancel} disabled={isLoading}>
				Cancelar
			</Button>
			<Button size="small" type="primary" onClick={onSave} loading={isLoading}>
				Guardar
			</Button>
		</div>
	</>
);
