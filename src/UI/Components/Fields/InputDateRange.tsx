import React, { FC, useEffect, useRef } from 'react';
import { DatePicker } from 'antd';
import { type RangePickerProps } from 'antd/es/date-picker';
import _ from 'lodash';

const defaultDateFormat = 'YYYY-MM-DD';

export type InputDateRangeProps = RangePickerProps;

const InputDateRange: FC<InputDateRangeProps> = ({ onChange, format = defaultDateFormat, ...rangePickerProps }) => {
	const lastValueRef = useRef(rangePickerProps.value); // Referencia para almacenar el último valor del input actualizado internamente

	//  Función para notificar al componente padre sobre el cambio en el valor
	const handleChange: RangePickerProps['onChange'] = (values, formatString) => {
		lastValueRef.current = values;
		onChange?.(values, formatString);
	};

	// Ejecuta handleChange si el valor del input se actualiza externamente
	useEffect(() => {
		if (rangePickerProps.value !== undefined && !_.isEqual(rangePickerProps.value, lastValueRef.current)) {
			handleChange(
				rangePickerProps?.value,
				[rangePickerProps?.value?.[0]?.format?.(defaultDateFormat) ?? '', rangePickerProps.value?.[1]?.format?.(defaultDateFormat) ?? ''],
			);
		}
	}, [rangePickerProps.value]);

	return (
		<DatePicker.RangePicker
			format={format}
			onChange={handleChange}
			style={{ width: '100%' }}
			{...rangePickerProps}
		/>
	);
};

export default InputDateRange;