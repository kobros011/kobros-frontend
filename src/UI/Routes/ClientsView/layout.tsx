import { MODULESNAME } from '@/constants/MODULESNAME';
import { GlobalFilters } from '@/UI/Components/Filters';
import { CheckSquareOutlined, PlusOutlined, SwapOutlined, ControlOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Space, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { Client } from '@/domain/Client';
import { deleteClient } from '@/infrastructure/querys/Client';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { OnClickActions } from '@/UI/Components/RowActions';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyClients, queryKeyDefault } from '@/constants/queryKeys';
import { TableClients } from './Tables';
import { ClientFiltersFields } from '@/UI/Components/Filters/FiltersFields/Client';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import { MoveClientsModal } from './priority/MoveClientsModal';
import { PriorityDrawer } from './priority/PriorityDrawer';
import { SelectionBar } from './priority/SelectionBar';
import { useCanManagePriority } from './priority/usePriorityAccess';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.clients;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);

	const filtersFields = ClientFiltersFields();
	const { routes } = useRoutes();
	const [count, setCount] = useState<{ active: number, inactive: number }>({ active: 0, inactive: 0 });

	const { notification } = App.useApp();

	const deleteMutation = deleteClient();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const hasMultipleRoutes = routes.length > 1;

	const canManage = useCanManagePriority();
	const filteredRouteId = filtersStore(state => state.filtersMap[moduleName])?.routeId ;
	const [selectionMode, setSelectionMode] = useState(false);
	const [selected, setSelected] = useState<Client[]>([]);
	const [moveOpen, setMoveOpen] = useState(false);
	const [priorityClient, setPriorityClient] = useState<Client>();

	const stopSelecting = () => {
		setSelectionMode(false);
		setSelected([]);
	};

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const onHandleDelete = (client_id: string) => {
		deleteMutation.mutate(client_id, {
			onSuccess: () => {
				setActiveTab(activeTab == `${moduleName}-active` ? `${moduleName}-inactive` : `${moduleName}-active`);
				void queryClient.invalidateQueries({ queryKey: [queryKeyClients.base, queryKeyDefault.list], exact: false });
				notification.success({ message: 'El cliente fue eliminado exitosamente' });
			},
			onError: (error) => {
				notification.error({ message: error?.message ?? 'Ocurrió un error al eliminar el cliente' });
			},
		});
	};

	const actions: OnClickActions<Client> = {
		delete: (record: Client) => onHandleDelete(record.id),
		see: (record: Client) => void navigate(`${record.id}`),
		edit: (record: Client) => void navigate(`${record.id}/editar`),
		inactiveTab: activeTab == `${moduleName}-inactive`,
		moreActions: [
			{
				action: (record: Client) => void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.LOANS}/${routePaths.DEFAULT_CREATE}`, { state: { clientId: record.id, routeIds: record.routesIds } }),
				key: 'addLoan',
				label: 'Crear crédito',
				icon: <PlusOutlined />,
			},
			{
				action: (record: Client) => setPriorityClient(record),
				key: 'priority',
				label: canManage ? 'Gestionar prioridad' : 'Ver prioridad',
				icon: <ControlOutlined />,
			},
		],
	};

	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Clientes</Typography.Title>
					</Col>
					<Col>
						<Space wrap>
							{canManage && (
								<>
									<Button icon={<SwapOutlined />} onClick={() => void navigate(`${routePaths.CLIENTS_ORDER}${filteredRouteId ? `?ruta=${filteredRouteId}` : ''}`)}>Ordenar ruta</Button>
									<Button icon={<CheckSquareOutlined />} type={selectionMode ? 'primary' : 'default'} ghost={selectionMode} onClick={() => (selectionMode ? stopSelecting() : setSelectionMode(true))}>
										{selectionMode ? 'Salir de selección' : 'Seleccionar'}
									</Button>
								</>
							)}
							<Button
								icon={<PlusOutlined />}
								type='primary'
								onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
							>
								Nuevo Cliente
							</Button>
						</Space>
					</Col>
				</Row>
			</div>
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre o Documento del cliente)'
				moduleName={MODULESNAME.clients}
				filters={hasMultipleRoutes ? filtersFields : []}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '', routeId: hasMultipleRoutes ? undefined : routes?.map(item => item.id)?.[0] }}
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
						children: <TableClients key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} selection={selectionMode ? { clients: selected, onChange: setSelected } : undefined} />,
					},
					{
						key: `${moduleName}-inactive`,
						forceRender: true,
						label: `Inactivos (${count.inactive})`,
						children: <TableClients key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} />,
					},
				]}
			/>

			{selectionMode && selected.length > 0 && (
				<SelectionBar
					count={selected.length}
					routeLabel={routes.find(route => route.id === filteredRouteId)?.name}
					onCancel={stopSelecting}
					onMove={() => setMoveOpen(true)}
				/>
			)}
			<MoveClientsModal
				open={moveOpen}
				clients={selected}
				routeId={filteredRouteId}
				onClose={() => setMoveOpen(false)}
				onDone={() => { setMoveOpen(false); stopSelecting(); }}
			/>
			<PriorityDrawer open={!!priorityClient} client={priorityClient} canManage={canManage} onClose={() => setPriorityClient(undefined)} />
		</>
	);
};