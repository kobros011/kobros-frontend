import { LoanFull } from '@/domain/Loan';
import { FormInstance } from 'antd';
import { FC } from 'react';
import { LoanFields } from './LoanFields';
import type { CustomFieldDef } from '@/domain/Settings';

interface LoanDataStepProps {
	form: FormInstance<Partial<LoanFull>>;
	disabled?: boolean;
	routeId?: string;
	customFields?: CustomFieldDef[];
}

/** Paso 3 del asistente de crédito: los campos del crédito (`LoanFields`). Cancelar / Crear van en el pie fijo del formulario. */
export const LoanDataStep: FC<LoanDataStepProps> = ({ form, disabled, routeId, customFields }) => (
	<LoanFields form={form as FormInstance} disabled={disabled} compact routeId={routeId} customFields={customFields} />
);
