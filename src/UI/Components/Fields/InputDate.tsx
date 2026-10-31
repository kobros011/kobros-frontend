import React, { useEffect, useRef, useState } from 'react';
import { DatePicker, DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es'; // Importa el idioma español

const defaultDateFormat = 'YYYY-MM-DD';

// Fecha actual
const currentDate = dayjs().startOf('day');
export type InputDateProps = DatePickerProps & {
	value?: Dayjs | string | null
	onChange?: (dateString: string | null, date: Dayjs | null) => void;
	useCurrentDate?: boolean;
};

const InputDate = ({ value, onChange, format = defaultDateFormat, useCurrentDate = false, ...extraProps }: InputDateProps) => {
	const [lastDateString, setLastDateString] = useState<string>(
		value && typeof value !== 'string'
			? value.format(format as string)
			: value || '',
	);

	const isFirstRender = useRef(true);
	let formattedValue: Dayjs | null = null;
	let formattedValueString: string = '';

	if (value) {
		formattedValue = dayjs(value, format as string);
		formattedValueString = formattedValue.format(format as string);
	} else if (isFirstRender.current && useCurrentDate) {
		formattedValue = currentDate;
		formattedValueString = formattedValue.format(format as string);
	}

	const handleChange = (date: Dayjs | null, dateString: string) => {
		onChange?.(dateString || null, date);
		setLastDateString(dateString);
	};

	useEffect(() => {
		if (formattedValueString !== lastDateString) {
			handleChange(formattedValue, formattedValueString);
		}

		if (isFirstRender.current) isFirstRender.current = false;
	}, [value]);

	return (
		<DatePicker
			value={formattedValue}
			onChange={handleChange}
			format={format}
			style={{ width: '100%' }}
			{...extraProps}
		/>
	);
};

export default InputDate;