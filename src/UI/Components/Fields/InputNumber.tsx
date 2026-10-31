import React, { FC, useEffect, useRef } from 'react';
import { InputNumber as AntdInputNumber, InputNumberProps as AntdInputNumberProps } from 'antd';
import { input, inputNumber } from '@/constants/Styles';

// Función para agregar separador de miles
export const addThousandSeparator = (value: string): string => {
	const separatorRegex = /\B(?=(\d{3})+(?!\d))/g; // Regex para separar 
	return value.replace(separatorRegex, ',');
};

// Limpia y formatea un número según el tipo especificado
const cleanAndFormatNumber = (value: string, numberType: NumberTypeOptions): string => {
	const nonNumericRegex = /[^\d.-]/g; // Regex para seleccionar los caracteres no numéricos
	const cleanedValue = value.replace(nonNumericRegex, '').replace(/-+/g, '-');

	if (cleanedValue === '' || cleanedValue === '-') return cleanedValue;

	return (
		numberType === 'positive' && cleanedValue[0] === '-' ? cleanedValue.slice(1) : // Eliminamos el signo '-' si el tipo de número es positivo
			numberType === 'negative' && cleanedValue[0] !== '-' ? `-${cleanedValue}` : // Agregamos el signo '-' si el tipo de número es negativo
				cleanedValue
	);
};

type NumberTypeOptions = 'positive' | 'negative' | 'all';
type EmptyValueOutputOptions = 'emptyString' | 'null';

export interface InputNumberProps extends Omit<AntdInputNumberProps, 'suffix'> {
	numberType?: NumberTypeOptions;
	thousandsSeparator?: boolean;
	fixedPrefix?: boolean;
	emptyValueOutput?: EmptyValueOutputOptions;
	suffix?: string
}

const InputNumber: FC<InputNumberProps> = ({
	numberType = 'all',
	thousandsSeparator = false,
	fixedPrefix = true,
	emptyValueOutput = 'emptyString',
	prefix,
	className,
	precision,
	onChange,
	onBlur,
	suffix,
	...inputProps
}) => {
	const lastValueRef = useRef(inputProps.value); // Referencia para almacenar el último valor del input actualizado internamente

	const precisionCurrency = precision ?? 2;

	const handleFormatter: AntdInputNumberProps['formatter'] = (value, info) => {
		const currentValue = info.userTyping ? cleanAndFormatNumber(info.input, numberType) : value?.toString() ?? '';
		if (currentValue === '' || currentValue === '-') return !suffix ? currentValue : `${currentValue}${suffix}`;

		const factor = Math.pow(10, precisionCurrency);
		const newCurrentValue = Math.round(Number(currentValue) * factor) / factor;

		const [integerPart, decimalPart] = newCurrentValue.toString().split('.');
	
		// Formateamos la parte entera del número, añadiendo un separador de miles si está habilitado
		const formattedIntegerPart = thousandsSeparator ? addThousandSeparator(integerPart) : integerPart;
		let formattedDecimalPart = '';
		if (!info.userTyping) {
			formattedDecimalPart = precisionCurrency > 0 ? (decimalPart ? `.${decimalPart.slice(0, precisionCurrency)}` : '.' + '0'.repeat(precisionCurrency)) : '';
			return !suffix ? `${formattedIntegerPart}${formattedDecimalPart}` : `${formattedIntegerPart}${formattedDecimalPart}${suffix}`;
		}

		formattedDecimalPart = precisionCurrency > 0 ? (decimalPart ? `.${decimalPart.slice(0, precisionCurrency)}` : '') : '';

		return !suffix ? `${formattedIntegerPart}${formattedDecimalPart}` : `${formattedIntegerPart}${formattedDecimalPart}${suffix}`;
	};

	const handleParser: AntdInputNumberProps['parser'] = (value) => value ? cleanAndFormatNumber(value, numberType) : '';

	const handleChange: AntdInputNumberProps['onChange'] = (value) => {
		lastValueRef.current = value;
		onChange?.(value);
	};

	const handleBlur: AntdInputNumberProps['onBlur'] = (e) => {
		const cleanedValue = cleanAndFormatNumber(e.target.value, numberType);

		const emptyValueOutputMap: Record<EmptyValueOutputOptions, string | null> = {
			emptyString: '',
			null: null,
		};

		if (cleanedValue === '') handleChange(emptyValueOutputMap[emptyValueOutput]);

		onBlur?.(e);
	};

	const prefixToShow = prefix
		? (fixedPrefix || inputProps.value) ? prefix : '\u200B' // '\u200B': espacio en blanco cero ancho, se utiliza en el prefix para evitar la pérdida del foco del input 
		: undefined;

	useEffect(() => {
		if (inputProps.value !== undefined && inputProps.value !== lastValueRef.current) {
			handleChange(inputProps.value);
		}
	}, [inputProps.value]);

	return (
		<AntdInputNumber
			prefix={prefixToShow}
			onChange={handleChange}
			onBlur={handleBlur}
			formatter={handleFormatter}
			controls={false}
			parser={handleParser}
			precision={precisionCurrency}
			style={{ ...inputProps.style, ...input, ...inputNumber }}
			{...inputProps}
		/>
	);
};

export default InputNumber;