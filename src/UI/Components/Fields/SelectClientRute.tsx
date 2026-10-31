import { useClientRoutes } from '@/infrastructure/hooks/useClientRoute';
import { filterOption, filterSortByOrder } from '@/infrastructure/utils/utils';
import { Select, SelectProps } from 'antd';
import { FC } from 'react';

interface SelectClientRouteProps extends Omit<SelectProps, 'options'> {
	routeId?: string
	clientId: string
}

export const SelectClientRoute: FC<SelectClientRouteProps> = (props) => {
	const { isLoading, clientRoutes } = useClientRoutes(props.routeId);

	const getOptions = () => {
		const filteredOption = clientRoutes?.filter(item => item.active && item.clientId != props.clientId);

		return filteredOption.map(item => ({ label: item.order + ' - ' + item.fullName + ' - ' + item.idDocument, value: item.order }));
	};

	const onHandleSelect = (value: string, option: { label: string, value: number | undefined }) => {
		props?.onSelect?.(value, option);
	};

	return (
		<Select
			loading={isLoading ?? false}
			options={getOptions()}
			onSelect={onHandleSelect}
			showSearch
			optionLabelProp="value"
			filterOption={filterOption}
			filterSort={filterSortByOrder}
			{...props}
		/>
	);
};