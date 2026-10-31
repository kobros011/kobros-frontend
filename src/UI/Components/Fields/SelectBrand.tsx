import { useBrands } from '@/infrastructure/hooks/useBrands';
import { Select, SelectProps } from 'antd';
import { FC } from 'react';

interface SelectBrandProps extends Omit<SelectProps, 'options'> {}

export const SelectBrand: FC<SelectBrandProps> = (props) => {
	const { isLoading, brands } = useBrands();

	const getOptions = () => {
		const filteredOption = brands?.filter(item => item.active);

		return filteredOption.map(item => ({ label: item.name, value: item.id }));
	};

	return (
		<Select
			defaultActiveFirstOption
			loading={isLoading ?? false}
			options={getOptions()}
			{...props}
		/>
	);
};