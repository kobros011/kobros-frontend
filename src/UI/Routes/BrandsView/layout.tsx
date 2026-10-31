import { MODULESNAME } from '@/constants/MODULESNAME';
import { GlobalFilters } from '@/UI/Components/Filters';
import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Row, Tabs, Typography } from 'antd';
import { FC, useState } from 'react';
import { Brand } from '@/domain/Brand';
import { deleteBrand } from '@/infrastructure/querys/Brand';
import { useNavigate } from 'react-router-dom';
import routePaths from '@/constants/routePaths';
import { OnClickActions } from '@/UI/Components/RowActions';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyBrands, queryKeyDefault } from '@/constants/queryKeys';
import { TableBrands } from './Tables';

export const Layout: FC = () => {
	const moduleName = MODULESNAME.brands;
	const [isSearching, setSearching] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState(`${moduleName}-active`);

	const [count, setCount] = useState<{ active: number, inactive: number }>({ active: 0, inactive: 0 });

	const { notification } = App.useApp();

	const deleteMutation = deleteBrand();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const onHandlerFilter = () => {
		if (!isSearching) setSearching(true);
	};

	const onHandleDelete = (brand_id: string) => {
		deleteMutation.mutate(brand_id, {
			onSuccess: () => {
				setActiveTab(activeTab == `${moduleName}-active` ? `${moduleName}-inactive` : `${moduleName}-active`);
				void queryClient.invalidateQueries({ queryKey: [queryKeyBrands.base, queryKeyDefault.list], exact: false });
				notification.success({ message: 'La marca fue eliminada exitosamente' });
			},
			onError: (error) => {
				notification.error({ message: error?.message ?? 'Ocurrió un error al eliminar la marca' });
			},
		});
	};

	const actions: OnClickActions<Brand> = {
		delete: (record: Brand) => onHandleDelete(record.id),
		see: (record: Brand) => void navigate(`${record.id}`),
		edit: (record: Brand) => void navigate(`${record.id}/editar`),
		inactiveTab: activeTab == `${moduleName}-inactive`,
	};

	return (
		<>
			<div className='page-header '>
				<Row justify="space-between" align="middle">
					<Col>
						<Typography.Title level={2}>Marcas</Typography.Title>
					</Col>
					<Col>
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => void navigate(`${routePaths.DEFAULT_CREATE}`)}
						>
							Nueva Marca
						</Button>
					</Col>
				</Row>
			</div>
			<GlobalFilters
				placeholderSearch='Buscar(EJ: Nombre de la marca)'
				moduleName={MODULESNAME.brands}
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
						children: <TableBrands key={'active'} setCount={setCount} type='active' actions={actions} isSearching={isSearching} />,
					},
					{
						key: `${moduleName}-inactive`,
						forceRender: true,
						label: `Inactivas (${count.inactive})`,
						children: <TableBrands key={'inactive'} setCount={setCount} type='inactive' actions={actions} isSearching={isSearching} />,
					},
				]}
			/>
		</>
	);
};