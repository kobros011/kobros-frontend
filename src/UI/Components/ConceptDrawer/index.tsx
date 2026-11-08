import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { getPermission } from '@/infrastructure/utils/Permissions';
import { PlusOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';
import { ConceptExpenseCreate } from './Create';
import { Button, Drawer, Segmented } from 'antd';
import { ListExpensesConcepts } from './List';

interface CoceptsDrawerProps {
	isOpen: boolean;
	onClose?: () => void;
}

type ConceptsView = 'active' | 'inactive';

export const ConceptsDrawer: FC<CoceptsDrawerProps> = ({ isOpen, onClose }) => {
	const { isMobile } = useUserModeStore(state => state);
	const { typeUser } = useUserStore(state => state.user);
	const { hasManageExpenses } = getPermission(typeUser);

	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [view, setView] = useState<ConceptsView>('active');

	return (
		<Drawer
			open={isOpen}
			onClose={onClose}
			placement={isMobile ? 'bottom' : 'right'}
			width={isMobile ? '100%' : 600}
			height={isMobile ? '93%' : 'auto'}
			title='Conceptos de Gastos'
			extra={hasManageExpenses && (
				<Button
					onClick={() => { setView('active'); setIsCreating(true); }}
					icon={<PlusOutlined />}
					type="primary"
				>
					Nuevo concepto
				</Button>
			)}
		>
			{hasManageExpenses && <ConceptExpenseCreate isCreating={isCreating} setIsCreating={setIsCreating} />}

			<Segmented<ConceptsView>
				block
				value={view}
				onChange={setView}
				options={[
					{ label: 'Activos', value: 'active' },
					{ label: 'Inactivos', value: 'inactive' },
				]}
				style={{ marginBottom: 12 }}
			/>

			<ListExpensesConcepts active={view === 'active'} canManage={hasManageExpenses} />
		</Drawer>
	);
};
