import { ColumnType } from 'antd/es/table';
import { ReactNode } from 'react';
import { formatNumber } from './formaNumber';
import dayjs from 'dayjs';
import TypographyParagraph from './TypographyParagraph';
import { Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { green } from '@ant-design/colors';

export interface CustomColumn<T> extends ColumnType<T> {
	typeRender?: 'money' | 'date' | 'number' | 'largeText' | 'boolean'
	showColumn?: boolean
	precision?: number
} 

export const BuildColumns = <T extends object>(columns: CustomColumn<T>[]): ColumnType<T>[] => {

	const getTypeRender = (value?: unknown, type?: CustomColumn<T>['typeRender'], column?: ColumnType<T>, precision?: number): ReactNode => {

		if (type == 'money' || type == 'number') {
			return (
				<>
					{formatNumber(value?.toString(), precision)}
				</>
			);
		}

		if (type == 'date') {
			const valueTyped = value as string;
			return value ? dayjs(valueTyped?.toString()).format('DD/MM/YYYY') : '--:--';
		}

		if (type == 'largeText') {
			const valueTyped = value as string;
			return <TypographyParagraph styles={{ textAlign: 'center', alignContent: 'center', alignItems: 'center' }} text={valueTyped?.toString()} width={column?.width ?? 0} />;
		}

		if (type == 'boolean') {
			const valueTyped = value as boolean;
			return <Button icon={valueTyped ? <CheckCircleOutlined /> : <CloseCircleOutlined /> } type="link" {...(valueTyped ? { style: { color: green[5] } } : { danger: true })} />;
		}

		return value?.toString();
	};

	return columns?.filter(item => item.showColumn !== false).map(({ typeRender, precision, ...column }) => ({
		...column,
		align: 'center',
		render: column.render && !typeRender ? column.render : (value: unknown ) => getTypeRender(value, typeRender, column, precision),
	}));
};