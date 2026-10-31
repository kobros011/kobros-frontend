import { useExpenseConcepts } from '@/infrastructure/hooks/useExpenseConcepts';
import { Button, Select, Space } from 'antd';
import { FC, useState } from 'react';
import { TagConceptSelect } from '../TagConcept';
import { SelectProps } from 'antd/lib';
import { ConceptsDrawer } from '../ConceptDrawer';
import { EditOutlined } from '@ant-design/icons';

interface SelectConceptProps extends Omit<SelectProps, 'children' | 'options'> {
	readonly?: boolean
}

export const SelectConcept: FC<SelectConceptProps> = ({ readonly, ...props }) => {

	const { expensesConcepts, isLoading } = useExpenseConcepts();

	const [openExpenseConcepts, setOpenExpenseConcepts] = useState(false);

	return (
		<>
			<Space.Compact style={{ width: '100%' }}>
				<Select
					loading={isLoading ?? false}
					style={{ width: '100%' }} 
					placeholder="Seleccione un concepto de gasto"
					{...props}
				>
					{expensesConcepts?.map(item => (
						<Select.Option key={item.id} value={item.id}>
							<TagConceptSelect concept={item}  />
						</Select.Option>
					),
					)}
				</Select>

				{!readonly &&
					<Button type="primary" onClick={() => setOpenExpenseConcepts(true)}><EditOutlined /></Button>
				}
			</Space.Compact>

			<ConceptsDrawer isOpen={openExpenseConcepts} onClose={() => setOpenExpenseConcepts(false)} />
		</>
	);
};