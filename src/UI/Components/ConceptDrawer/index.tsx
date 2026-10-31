import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { PlusOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';
import { ConceptExpenseCreate } from './Create';
import { Button, Drawer } from 'antd';
import { ListExpensesConcepts } from './List';

interface CoceptsDrawerProps {
	isOpen: boolean;
	onClose?: () => void;
}

export const ConceptsDrawer: FC<CoceptsDrawerProps> = ({ isOpen, onClose }) => {
	const { isMobile } = useUserModeStore(state => state);

	const [isCreating, setIsCreating] = useState<boolean>(false);

	return (
		<Drawer
			open={isOpen}
			onClose={onClose}
			placement={isMobile ? 'bottom' : 'right'}
			width={isMobile ? '100%' : 600}
			height={isMobile ? '93%' : 'auto'}
			title='Conceptos de Gastos'
			extra={<Button onClick={() => setIsCreating(true)} icon={<PlusOutlined />} type="primary">Nuevo concepto</Button>}
		>
			<ConceptExpenseCreate isCreating={isCreating} setIsCreating={setIsCreating} />

			<ListExpensesConcepts />
		</Drawer>
	);
};