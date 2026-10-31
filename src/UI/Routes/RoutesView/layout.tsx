import { MODULESNAME } from '@/constants/MODULESNAME';
import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { Route } from '@/domain/Route';
import { deleteRoute } from '@/infrastructure/querys/Route';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { OnClickActions } from '@/UI/Components/RowActions';
import { GlobalFilters } from '@/UI/Components/Filters';
import { TableRoutes } from './Table';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyDefault, queryKeyRoutes } from '@/constants/queryKeys';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.routes;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);

	const [count, setCount] = useState<{ active: number, inactive: number }>({ active: 0, inactive: 0 });

	const { notification } = App.useApp();

	const deleteMutation = deleteRoute();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const onHandleDelete = (brand_id: string) => {
		deleteMutation.mutate(brand_id, {
			onSuccess: () => {
				setActiveTab(activeTab == `${moduleName}-active` ? `${moduleName}-inactive` : `${moduleName}-active`);
				void queryClient.invalidateQueries({ queryKey: [queryKeyRoutes.base, queryKeyDefault.list], exact: false });
				notification.success({ message: 'La ruta fue eliminada exitosamente' });
			},
			onError: (error) => {
				notification.error({ message: error?.message ?? 'Ocurrió un error al eliminar la ruta' });
			},
		});
	};

	const actions: OnClickActions<Route> = {
		delete: (record: Route) => onHandleDelete(record.id),
		see: (record: Route) => void navigate(`${record.id}`),
		edit: (record: Route) => void navigate(`${record.id}/editar`),
		inactiveTab: activeTab == `${moduleName}-inactive`,
	};

	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Rutas</Typography.Title>
					</Col>
					<Col>
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
						>
							Nueva Ruta
						</Button>
					</Col>
				</Row>
			</div>
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre de la ruta)'
				moduleName={MODULESNAME.routes}
				filters={[]}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '' }}
			/>

			<Tabs
				style={{ width: '100%' }}
				activeKey={activeTab}
				onChange={(activeKey: string) => setActiveTab(activeKey)}
				items={[
					{
						key: `${moduleName}-active`,
						label: `Activas (${count.active})`,
						forceRender: true,
						children: <TableRoutes key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} />,
					},
					{
						key: `${moduleName}-inactive`,
						forceRender: true,
						label: `Inactivas (${count.inactive})`,
						children: <TableRoutes key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} />,
					},
				]}
			/>
		</>
	);
};