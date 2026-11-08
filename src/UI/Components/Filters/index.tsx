import { MODULESNAME } from '@/constants/MODULESNAME';
import { Filters } from '@/domain/Filters';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { Button, Col, Drawer, Flex, Form, Input, Row } from 'antd';
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

export const GlobalFilters: FC<FiltersProps> = ({ filters, moduleName, initialFilters, placeholderSearch, onSearch, isLoading }) => {
	const [form] = Form.useForm<Partial<Filters>>();

	const [showMoreFilters, setShowMoreFilters] = useState(false);

	const { isMobile } = useUserModeStore(state => state);
	const setFilters = filtersStore(state => state.setFilters);
	const filtersMap = filtersStore(state => state.filtersMap);
	
	const showFilters = filters.filter(item => item.isShow);

	const onHandleChangeValues = (changedValues: { [key: string]: unknown }) => {
		const keysToIgnore = ['text', 'textSearch'];

		Object.entries(changedValues).forEach(([key]) => {
			if (keysToIgnore.includes(key)) return;
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

	return (
		<Form
			form={form}
			onFinish={onFinish}
			onValuesChange={(changedValues: { [key: string]: unknown }) => onHandleChangeValues(changedValues)}
		>
			<Row gutter={[10, 10]} >
				<Col xs={(isMobile && showFilters.length == 0 ) ? 24 : 17} md={6}>
					<Form.Item
						name={'text'}
						style={{ width: '100%' }}
					>
						<Input.Search style={{ width: '100%' }} onSearch={form.submit} onClear={() => onClear()} allowClear placeholder={placeholderSearch ?? 'Buscar'} />
					</Form.Item>
				</Col>
				{!isMobile && 
					<Col span={1.5}>
						<PrimaryTooltip title="Limpiar filtros">
							<Button onClick={() => onClear()} type='primary' ghost><AiOutlineClear /></Button>
						</PrimaryTooltip>
					</Col>
				}
				{isMobile && showFilters.length > 0 &&
					<>
						<Col xs={6}>
							<Button onClick={() => setShowMoreFilters(!showMoreFilters)} type="primary" ghost >Más filtros</Button>
						</Col>

						<Drawer
							title={'Más filtros'}
							open={showMoreFilters}
							placement="bottom"
							height={'40%'}
							onClose={() => setShowMoreFilters(!setShowMoreFilters)}
							extra={
								<Flex gap={10}>
									<Button onClick={() => onClear()} type='primary' ghost>Limpiar filtros</Button>
									<Button onClick={form.submit} type='primary'>Buscar</Button>
								</Flex>
							}
						>
							<Row>
								{getFilters()} 
							</Row>
						</Drawer>
					</>
				}

				{!isMobile && <>{getFilters()}</>}
			</Row>
		</Form>
	);
};