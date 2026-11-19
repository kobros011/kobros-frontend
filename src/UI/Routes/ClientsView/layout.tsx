import { MODULESNAME } from '@/constants/MODULESNAME';
import { GlobalFilters } from '@/UI/Components/Filters';
import { CheckSquareOutlined, PlusOutlined, SwapOutlined, ControlOutlined } from '@ant-design/icons';
import { App, Button, Col, Flex, Row, Space, Tabs, Tag, Typography } from 'antd';
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
import { useClientFormConfig } from '@/infrastructure/hooks/useClientFormConfig';
import { useRoutes } from '@/infrastructure/hooks/useRoutes';
import { filtersStore } from '@/infrastructure/context/FiltersStore';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { MoveClientsModal } from './priority/MoveClientsModal';
import { PriorityDrawer } from './priority/PriorityDrawer';
import { SelectionBar } from './priority/SelectionBar';
import { useCanManagePriority } from './priority/usePriorityAccess';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.clients;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);
	const isMobile = useUserModeStore(state => state.isMobile);
	// En móvil el selector de vista se dibuja en la fila de tabs (ver `toolbarTarget` de CustomTable).
	const [toolbarTarget, setToolbarTarget] = useState<HTMLDivElement | null>(null);

	const clientView = useClientFormConfig();
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

	// En móvil los botones ocupan todo el ancho (`block`) con el tamaño estándar de antd.

	const orderButton = (
		<Button
			block={isMobile}
			icon={<SwapOutlined />}
			onClick={() => void navigate(`${routePaths.CLIENTS_ORDER}${filteredRouteId ? `?ruta=${filteredRouteId}` : ''}`)}
		>
			Ordenar ruta
		</Button>
	);

	const selectButton = (
		<Button
			block={isMobile}
			icon={<CheckSquareOutlined />}
			type={selectionMode ? 'primary' : 'default'}
			ghost={selectionMode}
			onClick={() => (selectionMode ? stopSelecting() : setSelectionMode(true))}
		>
			{selectionMode ? 'Salir de selección' : 'Seleccionar'}
		</Button>
	);

	const newClientButton = (
		<Button
			block={isMobile}
			icon={<PlusOutlined />}
			type='primary'
			onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
		>
			Nuevo Cliente
		</Button>
	);

	return (
		<>
			{isMobile ? (
				// El header del layout ya muestra "Clientes": aquí solo van las acciones.
				<Flex vertical gap={8} style={{ marginBottom: 12 }}>
					{newClientButton}
					{canManage && (
						<Row gutter={8}>
							<Col span={12}>{orderButton}</Col>
							<Col span={12}>{selectButton}</Col>
						</Row>
					)}
				</Flex>
			) : (
				<div className='page-header '>
					<Row justify="space-between" align="middle">
						<Col>
							<Flex align='center' gap={12}>
								<Typography.Title level={2} style={{ margin: 0 }}>Clientes</Typography.Title>
								<Tag color='success' bordered={false} style={{ borderRadius: 999, margin: 0, fontWeight: 600 }}>{count.active} registrados</Tag>
							</Flex>
							<Typography.Text type='secondary'>Gestión de cartera, asignación de ruta territorial y scoring de contacto operativo.</Typography.Text>
						</Col>
						<Col>
							<Space wrap>
								{canManage && (
									<>
										{orderButton}
										{selectButton}
									</>
								)}
								{newClientButton}
							</Space>
						</Col>
					</Row>
				</div>
			)}
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre o Documento del cliente)'
				moduleName={MODULESNAME.clients}
				filters={ClientFiltersFields(clientView.filterableCustomFields, hasMultipleRoutes)}
				onSearch={onHandlerFilter}
				initialFilters={{ text: '', routeId: hasMultipleRoutes ? undefined : routes?.map(item => item.id)?.[0] }}
			/>

			<Tabs
				style={{ width: '100%' }}
				activeKey={activeTab}
				onChange={(activeKey: string) => setActiveTab(activeKey)}
				tabBarExtraContent={isMobile ? <div ref={setToolbarTarget} style={{ minWidth: 0 }} /> : undefined}
				items={[
					{
						key: `${moduleName}-active`,
						label: `Activos (${count.active})`,
						forceRender: true,
						children: <TableClients key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} selection={selectionMode ? { clients: selected, onChange: setSelected } : undefined} toolbarTarget={isMobile && activeTab === `${moduleName}-active` ? toolbarTarget : undefined} />,
					},
					{
						key: `${moduleName}-inactive`,
						forceRender: true,
						label: `Inactivos (${count.inactive})`,
						children: <TableClients key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} toolbarTarget={isMobile && activeTab === `${moduleName}-inactive` ? toolbarTarget : undefined} />,
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
