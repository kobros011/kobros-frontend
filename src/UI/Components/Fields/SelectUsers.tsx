import { TypeUser } from '@/constants/types';
import { useUsers } from '@/infrastructure/hooks/useUsers';
import { getNameTypeUser } from '@/infrastructure/utils/getTypeUserText';
import { Select, SelectProps } from 'antd';
import { FC } from 'react';

interface SelectUsersProps extends Omit<SelectProps, 'options'  | 'maxTagCount'> { perType: boolean, branId: string }

export const SelectUsers: FC<SelectUsersProps> = (props) => {
	const { isLoading, users } = useUsers();

	const getOptions = () => {
		const filteredOption = users?.filter(item => item.active && ![TypeUser.dev, TypeUser.super].includes(item.typeUser) && item.brandId == props.branId);
		if (props.perType) {
			const usersAdmin = filteredOption.filter(item => item.typeUser == TypeUser.admin)?.map(item => ({ label: item.fullName, value: item.id }));
			const usersPartner = filteredOption.filter(item => item.typeUser == TypeUser.partner)?.map(item => ({ label: item.fullName, value: item.id }));
			const usersCollector = filteredOption.filter(item => item.typeUser == TypeUser.collector)?.map(item => ({ label: item.fullName, value: item.id }));

			return [
				{
					label: <span>Administradores</span>,
					title: 'Administradores',
					options: usersAdmin,
				},
				{
					label: <span>Socios</span>,
					title: 'Socios',
					options: usersPartner,
				},
				{
					label: <span>Cobradores</span>,
					title: 'Cobradores',
					options: usersCollector,
				},
			];

		}

		return filteredOption.map(item => ({ label: `${item.fullName} - ${getNameTypeUser(item.typeUser)}`, value: item.id }));
	};

	return (
		<Select
			loading={isLoading ?? false}
			options={getOptions()}
			maxTagCount={'responsive'}
			{...props}
		/>
	);
};