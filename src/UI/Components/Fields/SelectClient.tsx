import { Client } from '@/domain/Client';
import { getListClients } from '@/infrastructure/querys/Client';
import { SelectRoute } from '@/UI/Components/Fields/SelectRoute';
import { Select, SelectProps } from 'antd';
import { FC, useMemo, useState } from 'react';

interface SelectClientProps extends Omit<SelectProps, 'options' | 'onSelect'> {
	routeId?: string;
	showRouteSearch?: boolean;
	onSelect?: (value: string, option: { label: string; value: string; data: Client }) => void;
}

export const SelectClient: FC<SelectClientProps> = ({
	routeId: routeIdProp,
	showRouteSearch = false,
	onSelect,
	...selectProps
}) => {
	const [routeFilterId, setRouteFilterId] = useState<string | undefined>(undefined);
	const [searchText, setSearchText] = useState('');

	const effectiveRouteId = showRouteSearch
		? routeFilterId
		: routeIdProp;

	const { clients, isLoading, isFetching } = getListClients(
		{ active: true, ...(effectiveRouteId ? { routeId: effectiveRouteId } : {}) },
		true,
	);

	const displayClients = useMemo(() => {
		const list = clients ?? [];
		const trimmed = searchText.trim().toLowerCase();

		if (trimmed) {
			return list.filter(
				item =>
					item.fullName.toLowerCase().includes(trimmed) ||
					item.idDocument.toLowerCase().includes(trimmed),
			);
		}

		if (effectiveRouteId) {
			return list;
		}

		return list.slice(0, 10);
	}, [clients, searchText, effectiveRouteId]);

	const getOptions = () =>
		displayClients.map(item => ({
			label: `${item.fullName} - ${item.idDocument}`,
			value: item.id,
			data: item,
		}));

	const onHandleSelect = (value: string, option: { label: string; value: string; data: Client }) => {
		onSelect?.(value, option);
	};

	return (
		<>
			{showRouteSearch && (
				<SelectRoute
					placeholder="Filtrar por ruta (opcional)"
					value={routeFilterId}
					onChange={val => {
						setRouteFilterId(val as string | undefined);
						setSearchText('');
					}}
					allowClear
					style={{ width: '100%', marginBottom: 8 }}
				/>
			)}
			<Select
				defaultActiveFirstOption
				showSearch
				filterOption={false}
				onSearch={setSearchText}
				loading={(isLoading || isFetching) ?? false}
				options={getOptions()}
				onSelect={onHandleSelect}
				labelInValue
				{...selectProps}
			/>
		</>
	);
};
