import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { Select, SelectProps } from 'antd';
import { FC, useEffect } from 'react';

interface SelectRouteProps extends Omit<SelectProps<string>, 'options'> { }

export const SelectRoute: FC<SelectRouteProps> = ({ onChange, value, disabled, ...rest }) => {
	const { isLoading, routes } = useRoutes();

	const hasMultipleRoutes = routes.length > 1;
	const singleRouteId = routes.length === 1 ? routes[0].id : undefined;

	useEffect(() => {
		if (routes.length === 1 && !value && singleRouteId) {
			onChange?.(singleRouteId);
		}
	}, [routes, value, singleRouteId, onChange]);

	const getOptions = () => {
		return routes.map(item => ({ label: item.name, value: item.id }));
	};

	const resolvedValue = value ?? singleRouteId;

	return (
		<Select
			{...rest}
			onChange={onChange}
			loading={isLoading ?? false}
			options={getOptions()}
			disabled={!hasMultipleRoutes || disabled}
			value={resolvedValue}
		/>
	);
};