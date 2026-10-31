import { MODULESNAME } from '@/constants/MODULESNAME';
import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { OnClickActions } from '@/UI/Components/RowActions';
import { deleteUser } from '@/infrastructure/querys/User';
import { User } from '@/domain/User';
import { GlobalFilters } from '@/UI/Components/Filters';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyDefault, queryKeyUsers } from '@/constants/queryKeys';
import { TableUsers } from './Table';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.users;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);

	const [count, setCount] = useState<{ active: number, inactive: number }>({ active: 0, inactive: 0 });

	const { notification } = App.useApp();

	const deleteMutation = deleteUser();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const onHandleDelete = (user_id: string) => {
		deleteMutation.mutate(user_id, {
			onSuccess: () => {
				setActiveTab(activeTab == `${moduleName}-active` ? `${moduleName}-inactive` : `${moduleName}-active`);
				void queryClient.invalidateQueries({ queryKey: [queryKeyUsers.base, queryKeyDefault.list], exact: false });
				notification.success({ message: 'El usuario fue eliminado exitosamente' });
			},
			onError: (error) => {
				notification.error({ message: error?.message ?? 'Ocurrió un error al eliminar el usuario' });
			},
		});
	};

	const actions: OnClickActions<User> = {
		delete: (record: User) => onHandleDelete(record.id),
		see: (record: User) => void navigate(`${record.id}`),
		edit: (record: User) => void navigate(`${record.id}/editar`),
		inactiveTab: activeTab == `${moduleName}-inactive`,
	};
	
	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Usuarios</Typography.Title>
					</Col>
					<Col>
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
						>
							Nuevo Usuario
						</Button>
					</Col>
				</Row>
			</div>
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre del usuario)'
				moduleName={MODULESNAME.users}
				filters={[]}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '' }}
				isLoading
			/>

			<Tabs
				style={{ width: '100%' }}
				activeKey={activeTab}
				onChange={(activeKey: string) => setActiveTab(activeKey)}
				items={[
					{
						key: `${moduleName}-active`,
						label: `Activos (${count.active})`,
						forceRender: true,
						children: <TableUsers key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} />,
					},
					{
						key: `${moduleName}-inactive`,
						forceRender: true,
						label: `Inactivos (${count.inactive})`,
						children: <TableUsers key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} />,
					},
				]}
			/>
		</>
	);
};