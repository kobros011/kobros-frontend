import React, { FC } from 'react';
import { InputNumber as AntdInputNumber, InputNumberProps as AntdInputNumberProps } from 'antd';
import { input, inputNumber } from '@/constants/Styles';

export const addThousandSeparator = (value: string): string => {
	const separatorRegex = /\B(?=(\d{3})+(?!\d))/g;
	return value.replace(separatorRegex, ',');
};

const cleanAndFormatNumber = (value: string, numberType: NumberTypeOptions): string => {
	const nonNumericRegex = /[^\d.-]/g;
	const cleanedValue = value.replace(nonNumericRegex, '').replace(/-+/g, '-');

	if (cleanedValue === '' || cleanedValue === '-') return cleanedValue;

	if (numberType === 'positive' && cleanedValue[0] === '-') return cleanedValue.slice(1);
	if (numberType === 'negative' && cleanedValue[0] !== '-') return `-${cleanedValue}`;
	return cleanedValue;
};

const parseDisplayToNumber = (displayValue: string | undefined, numberType: NumberTypeOptions): number | null => {
	if (!displayValue) return null;
	const cleaned = cleanAndFormatNumber(displayValue, numberType);
	if (cleaned === '' || cleaned === '-') return null;
	const parsed = Number(cleaned);
	return Number.isFinite(parsed) ? parsed : null;
};

type NumberTypeOptions = 'positive' | 'negative' | 'all';
type EmptyValueOutputOptions = 'emptyString' | 'null';

export interface InputNumberProps extends Omit<AntdInputNumberProps, 'suffix'> {
	numberType?: NumberTypeOptions;
	thousandsSeparator?: boolean;
	fixedPrefix?: boolean;
	emptyValueOutput?: EmptyValueOutputOptions;
	suffix?: string;
}

const InputNumber: FC<InputNumberProps> = ({
	numberType = 'all',
	thousandsSeparator = false,
	fixedPrefix = true,
	emptyValueOutput = 'emptyString',
	prefix,
	precision,
	onChange,
	onBlur,
	suffix,
	value,
	...inputProps
}) => {
	const precisionCurrency = precision ?? 2;

	const handleFormatter: AntdInputNumberProps['formatter'] = (val, info) => {
		if (val === null || val === undefined || val === '') return '';

		if (info.userTyping) {
			const raw = cleanAndFormatNumber(info.input, numberType);
			if (raw === '' || raw === '-') return raw;
			const [integerPart, decimalPart] = raw.split('.');
			const formattedInteger = thousandsSeparator ? addThousandSeparator(integerPart) : integerPart;
			const decimals =
				precisionCurrency > 0 && decimalPart !== undefined ? `.${decimalPart.slice(0, precisionCurrency)}` : '';
			return suffix ? `${formattedInteger}${decimals}${suffix}` : `${formattedInteger}${decimals}`;
		}

		const numeric = typeof val === 'number' ? val : Number(cleanAndFormatNumber(String(val), numberType));
		if (!Number.isFinite(numeric)) return '';

		const fixed = precisionCurrency > 0 ? numeric.toFixed(precisionCurrency) : String(Math.round(numeric));
		const [integerPart, decimalPart] = fixed.split('.');
		const formattedInteger = thousandsSeparator ? addThousandSeparator(integerPart) : integerPart;
		const decimals = precisionCurrency > 0 ? `.${decimalPart ?? '0'.repeat(precisionCurrency)}` : '';
		const formatted = `${formattedInteger}${decimals}`;
		return suffix ? `${formatted}${suffix}` : formatted;
	};

	const handleParser: AntdInputNumberProps['parser'] = (displayValue) =>
		parseDisplayToNumber(displayValue, numberType) as unknown as string;

	const handleChange: AntdInputNumberProps['onChange'] = (next) => {
		onChange?.(next);
	};

	const handleBlur: AntdInputNumberProps['onBlur'] = (e) => {
		const cleanedValue = cleanAndFormatNumber(e.target.value, numberType);
		const emptyValueOutputMap: Record<EmptyValueOutputOptions, string | null> = {
			emptyString: '',
			null: null,
		};
		if (cleanedValue === '') onChange?.(emptyValueOutputMap[emptyValueOutput] as unknown as number);
		onBlur?.(e);
	};

	const prefixToShow = prefix
		? fixedPrefix || value !== undefined && value !== null && value !== ''
			? prefix
			: '\u200B'
		: undefined;

	return (
		<AntdInputNumber
			{...inputProps}
			value={value}
			prefix={prefixToShow}
			onChange={handleChange}
			onBlur={handleBlur}
			formatter={handleFormatter}
			controls={false}
			parser={handleParser}
			style={{ ...inputProps.style, ...input, ...inputNumber }}
		/>
	);
};

export default InputNumber;
