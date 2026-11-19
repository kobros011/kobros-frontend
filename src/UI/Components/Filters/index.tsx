import { MODULESNAME } from '@/constants/MODULESNAME';
import { Filters } from '@/domain/Filters';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { Badge, Button, Col, Drawer, Flex, Form, Input, Row } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { PrimaryTooltip } from '@/UI/Components/PrimaryTooltip';
import React, { FC, useEffect, useState } from 'react';
import { AiOutlineClear } from 'react-icons/ai';

export interface ItemFilter {
	name?: string,
	key: string,
	inputComponent: React.ReactNode,
	withFormITem?: boolean,
	isShow: boolean,
	colSpan?: number
}

export interface FiltersProps {
	filters: ItemFilter[]
	moduleName: MODULESNAME
	placeholderSearch?: string
	initialFilters: Partial<Filters>
	onSearch: (values: Partial<Filters>) => void
	isLoading?: boolean
}

const TEXT_FILTER_KEYS = ['text', 'textSearch'];

export const GlobalFilters: FC<FiltersProps> = ({ filters, moduleName, initialFilters, placeholderSearch, onSearch, isLoading }) => {
	const [form] = Form.useForm<Partial<Filters>>();

	const [showMoreFilters, setShowMoreFilters] = useState(false);

	const { isMobile } = useUserModeStore(state => state);
	const setFilters = filtersStore(state => state.setFilters);
	const filtersMap = filtersStore(state => state.filtersMap);

	const showFilters = filters.filter(item => item.isShow);

	// Punto indicador en el botón de filtros (móvil): hay algún filtro distinto del texto y del valor inicial.
	const hasActiveFilter = Object.entries(filtersMap[moduleName] ?? {}).some(([key, value]) => {
		if (TEXT_FILTER_KEYS.includes(key)) return false;
		if (value === undefined || value === null || value === '') return false;
		if (Array.isArray(value) && value.length === 0) return false;
		return value !== (initialFilters as Record<string, unknown>)[key];
	});

	const onHandleChangeValues = (changedValues: { [key: string]: unknown }) => {
		Object.entries(changedValues).forEach(([key]) => {
			if (TEXT_FILTER_KEYS.includes(key)) return;
			if (!showMoreFilters && !isLoading) form.submit();
		});
	};

	const setValuesForm = (values: Partial<Filters>) => {
		form.setFieldsValue(values);
		onHandleChangeValues(values as unknown as { [key: string]: unknown });
		form.submit();
	};

	const onFinish = (values: Partial<Filters>) => {
		setFilters(moduleName, values);
		onSearch?.(values);
		setShowMoreFilters(false);
	};

	const onClear = () => {
		setFilters(moduleName, initialFilters);
		onSearch?.(initialFilters);
		form.resetFields();
		form.setFieldsValue(initialFilters);
		setShowMoreFilters(false);
	};


	useEffect(() => {
		const valuesStore = filtersMap[moduleName] ?? initialFilters;
		if (valuesStore) {
			setValuesForm(valuesStore);
		} else {
			form.setFieldsValue(valuesStore);
			onSearch?.(valuesStore);
		}

	}, [moduleName]);

	const getFilters = () => (
		<>
			{showFilters?.map(({ isShow, colSpan, ...item }) => (
				<Col xs={24} md={colSpan ?? 6} key={item.key}>
					{item.withFormITem ? (
						<>{item.inputComponent}</>
					) : (
						<Form.Item
							name={item.name}
						>
							{item.inputComponent}
						</Form.Item>
					)}
				</Col>
			))}
		</>
	);

	// Móvil: buscador y botón de filtros (solo icono) en una sola fila; los filtros abren una hoja inferior.
	if (isMobile) {
		return (
			<Form
				form={form}
				onFinish={onFinish}
				onValuesChange={(changedValues: { [key: string]: unknown }) => onHandleChangeValues(changedValues)}
			>
				<Flex gap={8} align="center" style={{ marginBottom: 12 }}>
					<Form.Item
						name={'text'}
						style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
					>
						<Input.Search style={{ width: '100%' }} onSearch={form.submit} onClear={() => onClear()} allowClear placeholder={placeholderSearch ?? 'Buscar'} />
					</Form.Item>
					{showFilters.length > 0 && (
						<Badge dot={hasActiveFilter} offset={[-6, 6]}>
							<Button
								aria-label="Filtros"
								icon={<FilterOutlined />}
								onClick={() => setShowMoreFilters(true)}
							/>
						</Badge>
					)}
				</Flex>

				<Drawer
					title="Filtros"
					open={showMoreFilters}
					placement="bottom"
					height="auto"
					onClose={() => setShowMoreFilters(false)}
					// Los botones van dentro del cuerpo (no en un pie aparte) para que queden siempre visibles,
					// y se deja el espacio inferior del área segura del teléfono.
					styles={{ body: { padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))' } }}
				>
					<Row>
						{getFilters()}
					</Row>
					<Flex gap={8}>
						<Button block onClick={() => onClear()}>Limpiar</Button>
						<Button block type='primary' onClick={form.submit}>Aplicar</Button>
					</Flex>
				</Drawer>
			</Form>
		);
	}

	return (
		<Form
			form={form}
			onFinish={onFinish}
			onValuesChange={(changedValues: { [key: string]: unknown }) => onHandleChangeValues(changedValues)}
		>
			<Row gutter={[10, 10]} >
				<Col xs={24} md={6}>
					<Form.Item
						name={'text'}
						style={{ width: '100%' }}
					>
						<Input.Search style={{ width: '100%' }} onSearch={form.submit} onClear={() => onClear()} allowClear placeholder={placeholderSearch ?? 'Buscar'} />
					</Form.Item>
				</Col>
				<Col span={1.5}>
					<PrimaryTooltip title="Limpiar filtros">
						<Button onClick={() => onClear()} type='primary' ghost><AiOutlineClear /></Button>
					</PrimaryTooltip>
				</Col>

				{getFilters()}
			</Row>
		</Form>
	);
};
