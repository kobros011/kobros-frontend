import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { getListExpensesConcepts } from '@/infrastructure/querys/ExpenseConcepts';
import { Button, Col, Divider, List, Row, Tag, theme, Tooltip } from 'antd';
import { FC, useState } from 'react';
import { iconMap } from '../Fields/SelectIcon';
import { EditOutlined } from '@ant-design/icons';
import { ConceptExpenseCreate } from './Create';
import '@/App.css';

const ListItem: FC<{ expenseConcept?: ExpensesConcepts }> = ({ expenseConcept  }) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const { token: { lime6 } } = theme.useToken();

	const Icon = iconMap[expenseConcept?.keyIcon as keyof typeof iconMap]?.component;
	const color = expenseConcept?.color;

	if (isEditing) {
		return (
			<ConceptExpenseCreate key={expenseConcept?.id} expenseConcept={expenseConcept} isCreating={isEditing} setIsCreating={setIsEditing} />
		);
	}

	return (
		<>
			<Row gutter={5} justify={'space-between'}>
				<Col span={3}>
					<Icon style={{ fontSize: '28px', color: color, marginLeft: 12 }} />
				</Col>

				<Col xs={17} md={18}>
					<Tag color={color}>
						{expenseConcept?.concept}
					</Tag> 
				</Col>

				<Col xs={3} md={2}>
					<Tooltip color={lime6} title='Editar'>
						<Button
							size="small"
							type="primary"
							icon={<EditOutlined />}
							onClick={() => setIsEditing(true)}
						/>
					</Tooltip>
				</Col>
			</Row>

			<Divider style={{ padding: 2, margin: 5 }} />
		</>
	);
};

export const ListExpensesConcepts: FC = () => {

	const { expensesConcepts, isLoading, isRefetching } = getListExpensesConcepts();

	return (
		<List
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '600px' }}
			loading={isLoading || isRefetching}
			dataSource={expensesConcepts}
			renderItem={(item, index) => (<ListItem expenseConcept={item} key={index} />)}
		/>
	);
};