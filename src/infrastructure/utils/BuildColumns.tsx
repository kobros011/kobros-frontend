import { ColumnType } from 'antd/es/table';
import { ReactNode } from 'react';
import { formatNumber } from './formaNumber';
import { formatRouteMoney } from './money';
import dayjs from 'dayjs';
import TypographyParagraph from './TypographyParagraph';
import { Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { green } from '@ant-design/colors';

export interface CustomColumn<T> extends ColumnType<T> {
	typeRender?: 'money' | 'date' | 'number' | 'largeText' | 'boolean'
	showColumn?: boolean
	precision?: number
	/** Propiedad del registro con el id de la ruta, de donde sale la moneda de una columna `money` (por defecto `route_id` / `routeId`). */
	routeKey?: string
	/** Si es false, la columna existe y es activable desde "Columnas", pero no viene visible la primera vez que se abre el módulo. */
	defaultVisible?: boolean
}

export const renderTypedValue = (
	value?: unknown,
	type?: CustomColumn<object>['typeRender'],
	width?: number,
	precision?: number,
	routeId?: string,
): ReactNode => {

	if (type == 'money') {
		return <>{formatRouteMoney(Number(value ?? 0), routeId)}</>;
	}

	if (type == 'number') {
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
		return <TypographyParagraph styles={{ textAlign: 'center', alignContent: 'center', alignItems: 'center' }} text={valueTyped?.toString()} width={width ?? 0} />;
	}

	if (type == 'boolean') {
		const valueTyped = value as boolean;
		return <Button icon={valueTyped ? <CheckCircleOutlined /> : <CloseCircleOutlined /> } type="link" {...(valueTyped ? { style: { color: green[5] } } : { danger: true })} />;
	}

	return value?.toString();
};

export const BuildColumns = <T extends object>(columns: CustomColumn<T>[]): ColumnType<T>[] => {

	return columns?.filter(item => item.showColumn !== false).map(({ typeRender, precision, routeKey, ...column }) => ({
		...column,
		align: 'center',
		render: column.render && !typeRender ? column.render : (value: unknown, record: T) => {
			const row = record as Record<string, unknown>;
			const routeId = (row[routeKey ?? 'route_id'] ?? row.routeId) as string | undefined;
			return renderTypedValue(value, typeRender, typeof column.width === 'number' ? column.width : undefined, precision, routeId);
		},
	}));
};