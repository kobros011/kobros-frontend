import { FC, useEffect, useRef } from 'react';
import { Form, Input, Tooltip, type FormItemProps } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import InputDateRange, { type InputDateRangeProps } from '@components/Fields/InputDateRange';

interface RangeDateProps extends
	Pick<FormItemProps, 'noStyle'> {
	nameInputInitial?: string;
	nameInputEnd?: string;
	label?: string;
	className?: string;
	placeholder?: [string, string];
	tooltip?: string;
}

const RangeDate: FC<RangeDateProps> = ({ nameInputInitial, nameInputEnd, label, className, placeholder, tooltip, noStyle }) => {
	const lastInputValuesRef = useRef<Parameters<NonNullable<InputDateRangeProps['onChange']>>[1]>(['', '']); // Referencia para almacenar los últimos valores en formato string de los input actualizados internamente

	const form = Form.useFormInstance();
	const inputInitial = (Form.useWatch(nameInputInitial, form) as string | undefined) ?? '';
	const inputEnd = (Form.useWatch(nameInputEnd, form) as string | undefined) ?? '';

	const rangeFieldName = `dateSearchRange${nameInputInitial}`;

	const handleChange: InputDateRangeProps['onChange'] = (values, datesString) => {
		lastInputValuesRef.current = datesString;
		form.setFieldValue(nameInputInitial, datesString[0]);
		form.setFieldValue(nameInputEnd, datesString[1]);
	};

	// Sincroniza el valor del DatePicker.RangePicker con los campos individuales de inicio y fin si cambian externamente
	useEffect(() => {
		if (!_.isEqual([inputInitial, inputEnd], lastInputValuesRef.current)) {
			const rangeValues =
				inputInitial || inputEnd
					? [
						inputInitial ? dayjs(inputInitial) : null,
						inputEnd ? dayjs(inputEnd) : null,
					]
					: null;

			form.setFieldValue(rangeFieldName, rangeValues);
		}
	}, [inputInitial, inputEnd]);

	return (
		<>
			<Tooltip title={tooltip}>
				<Form.Item noStyle={noStyle} label={label} name={rangeFieldName} className={className} style={{ width: '100%' }}>
					<InputDateRange onChange={handleChange} placeholder={placeholder} />
				</Form.Item>
			</Tooltip>

			<Form.Item
				name={nameInputInitial}
				hidden
			>
				<Input name={nameInputInitial} />
			</Form.Item>

			<Form.Item
				name={nameInputEnd}
				hidden
			>
				<Input name={nameInputEnd} />
			</Form.Item>
		</>
	);
};

export default RangeDate;