import { ChangeEvent, CSSProperties, FC, useState } from 'react';
import InputDate, { InputDateProps } from './InputDate';
import { Form, FormItemProps, Input, InputProps, Select, SelectProps, theme } from 'antd';
import { Dayjs } from 'dayjs';
import { getBorderedStyle } from '@/infrastructure/utils/utils';
import InputNumber, { InputNumberProps } from './InputNumber';
import { PaymentMethodOptions } from '@/constants/OptionsSelects';
import { SelectClientRoute } from './SelectClientRute';
import './index.css';

export const style: CSSProperties = { padding: '0 0 0 2px', margin: 0 };

interface FormItemCustomProps extends Pick<FormItemProps, 'label' | 'name' | 'rules' | 'hasFeedback' > {}

interface FieldDateProps extends FormItemCustomProps, Omit<InputDateProps, 'label' | 'name'>  {
	name: string;
	useCurrentDate?: boolean;
}

export const FieldDateTable: FC<FieldDateProps> = ({ label, name, rules, onChange, ...props }) => {
	const [isEmpty, setIsEmpty] = useState(false);

	const { token } = theme.useToken();

	const borderedStyle: CSSProperties = { border: '1px solid' + token.colorPrimary };

	const onHandleChange = (date: Dayjs | undefined, dateString: string | string[]) => {
		setIsEmpty(!dateString.toString().trim());
		onChange?.(date, dateString);
	};

	return (
		<Form.Item
			label={label}
			name={name}
			rules={rules}
			noStyle
		>
			<InputDate variant="borderless" suffixIcon={null} allowClear={false} placeholder=" " style={{ ...style, ...(isEmpty ? borderedStyle : {}) }} onChange={onHandleChange} {...props} />
		</Form.Item>
	);
};

interface FieldTextTableProps extends FormItemCustomProps, Omit<InputProps, 'label' | 'name'> { name: string }

export const FieldTextTable: FC<FieldTextTableProps> = ({ label, name, rules, onChange, ...props }) => {
	const [isEmpty, setIsEmpty] = useState(true);

	const onHandleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const values = event.target.value;
		setIsEmpty(!values.toString().trim());
		onChange?.(event);
	};

	return (
		<Form.Item
			label={label}
			name={name}
			rules={rules}
			noStyle
		>
			<Input onChange={onHandleChange} variant="borderless" style={{ ...style, ...getBorderedStyle(!props.readOnly ? isEmpty : false) }} placeholder=" " {...props} />
		</Form.Item>
	);
};

interface FieldNumberTableProps extends FormItemCustomProps, Omit<InputNumberProps, 'label' | 'name'> { name: string }

export const FieldNumberTable: FC<FieldNumberTableProps> = ({ label, name, rules, suffix, onChange, ...props }) => {
	const [isEmpty, setIsEmpty] = useState(true);

	const onHandleChange = (value: string | number | null ) => {
		setIsEmpty(!value?.toString().trim());
		onChange?.(value);
	};

	return (
		<Form.Item
			label={label}
			name={name}
			rules={rules}
			noStyle
		>
			<InputNumber suffix={suffix} onChange={(value) => onHandleChange(value)} variant="borderless" style={{ width: '100%', ...style, ...getBorderedStyle(!props.readOnly ? isEmpty : false) }} placeholder=" " {...props} />
		</Form.Item>
	);
};

interface FieldMethodTableProps extends FormItemCustomProps, Omit<SelectProps, 'label' | 'name'> { name: string, readOnly?: boolean }

export const FieldMethodTable: FC<FieldMethodTableProps> = ({ label, name, rules, onChange, ...props }) => {
	const [isEmpty, setIsEmpty] = useState(true);

	const onHandleChange = (value: string | number | null ) => {
		setIsEmpty(!value?.toString().trim());
		onChange?.(value);
	};

	return (
		<Form.Item
			label={label}
			name={name}
			rules={rules}
			noStyle
		>
			<Select className="p-1" size="small" suffixIcon={null} options={PaymentMethodOptions} onChange={(value: string | number | null) => onHandleChange(value)} variant="borderless" style={{ width: '100%', ...style, alignItems: 'start', padding: 0, ...getBorderedStyle(!props.readOnly ? isEmpty : false) }} placeholder=" " {...props} />
		</Form.Item>
	);
};

interface FieldOrderTableProps extends FormItemCustomProps, Omit<SelectProps, 'label' | 'name'> { routeId?: string, clientId: string, name: string }

export const FieldOrderTable: FC<FieldOrderTableProps> = ({ label, name, rules, ...props }) => {

	return (
		<Form.Item
			label={label}
			name={name}
			rules={rules}
			noStyle
		>
			<SelectClientRoute
				className="p-1"
				popupMatchSelectWidth={false} 
				size="small" suffixIcon={null} 
				variant="borderless" style={{ width: '100%', ...style, alignItems: 'start', padding: 0 }} 
				placeholder=" "
				{...props}
			/>
		</Form.Item>
	);
};