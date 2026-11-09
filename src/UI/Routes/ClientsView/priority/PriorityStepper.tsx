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
}

/** − #8 + : controles mínimos con el número editable. */
export const PriorityStepper: FC<PriorityStepperProps> = ({ value, max, onChange, disabled, label = 'Posición' }) => {
	const { token } = theme.useToken();
	const box = 28;
	return (
		<div role="group" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
			<Button size="small" aria-label="Bajar una posición" icon={<MinusOutlined />} disabled={disabled || value <= 1} onClick={() => onChange(clampPosition(value - 1, max))} style={{ width: box, height: box }} />
			<InputNumber
				size="small"
				aria-label={label}
				className="kb-mono"
				controls={false}
				min={1}
				max={Math.max(max, 1)}
				value={value}
				disabled={disabled}
				prefix="#"
				onChange={next => onChange(clampPosition(next, max))}
				style={{ width: 60, height: box, fontWeight: 800, color: token.colorPrimary }}
			/>
			<Button size="small" aria-label="Subir una posición" icon={<PlusOutlined />} disabled={disabled || value >= max} onClick={() => onChange(clampPosition(value + 1, max))} style={{ width: box, height: box }} />
		</div>
	);
};
