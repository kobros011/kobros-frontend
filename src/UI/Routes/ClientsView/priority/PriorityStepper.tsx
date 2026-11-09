import { FC } from 'react';
import { Button, InputNumber, theme } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { clampPosition } from './moveLogic';

interface PriorityStepperProps {
	value: number
	max: number
	onChange: (value: number) => void
	disabled?: boolean
	label?: string
	/** Versión mínima (28 px, por defecto); `false` devuelve los controles de 40 px. */
	compact?: boolean
}

/** − #8 + : controles mínimos con el número editable. */
export const PriorityStepper: FC<PriorityStepperProps> = ({ value, max, onChange, disabled, label = 'Posición', compact = true }) => {
	const { token } = theme.useToken();
	const box = compact ? 28 : 40;
	return (
		<div role="group" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 4 : 8 }}>
			<Button size={compact ? 'small' : 'middle'} aria-label="Bajar una posición" icon={<MinusOutlined />} disabled={disabled || value <= 1} onClick={() => onChange(clampPosition(value - 1, max))} style={{ width: box, height: box }} />
			<InputNumber
				size={compact ? 'small' : 'middle'}
				aria-label={label}
				className="kb-mono"
				controls={false}
				min={1}
				max={Math.max(max, 1)}
				value={value}
				disabled={disabled}
				prefix="#"
				onChange={next => onChange(clampPosition(next, max))}
				style={{ width: compact ? 60 : 84, height: box, fontWeight: 800, color: token.colorPrimary }}
			/>
			<Button size={compact ? 'small' : 'middle'} aria-label="Subir una posición" icon={<PlusOutlined />} disabled={disabled || value >= max} onClick={() => onChange(clampPosition(value + 1, max))} style={{ width: box, height: box }} />
		</div>
	);
};
