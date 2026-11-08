import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { deleteExpenseConcept, getListExpensesConcepts } from '@/infrastructure/querys/ExpenseConcepts';
import { App, Button, Col, Divider, List, Row, Space, Tag, theme, Tooltip } from 'antd';
import { FC, useState } from 'react';
import { iconMap } from '../Fields/SelectIcon';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { ConceptExpenseCreate } from './Create';
import { queryKeyDefault, queryKeyExpenses, queryKeyExpensesConcepts } from '@/constants/queryKeys';
import useExpensesConceptsStore from '@/infrastructure/context/ConceptsStore';
import { handleError } from '@/infrastructure/utils/handleError';
import '@/App.css';

interface ListItemProps {
	expenseConcept?: ExpensesConcepts
	canManage: boolean
	isInactive: boolean
	onToggle: (expenseConcept: ExpensesConcepts) => void
}

const ListItem: FC<ListItemProps> = ({ expenseConcept, canManage, isInactive, onToggle }) => {
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
			<Row gutter={5} justify={'space-between'} align={'middle'}>
				<Col span={3}>
					{Icon && <Icon style={{ fontSize: '28px', color: color, marginLeft: 12 }} />}
				</Col>

				<Col xs={14} md={16}>
					<Tag color={color}>
						{expenseConcept?.concept}
					</Tag>
				</Col>

				{canManage && expenseConcept && (
					<Col xs={7} md={5} style={{ textAlign: 'right' }}>
						<Space.Compact>
							{!isInactive && (
								<Tooltip color={lime6} title='Editar'>
									<Button
										size="small"
										type="primary"
										icon={<EditOutlined />}
										onClick={() => setIsEditing(true)}
									/>
								</Tooltip>
							)}
							<Tooltip color={isInactive ? lime6 : 'red'} title={isInactive ? 'Activar' : 'Desactivar'}>
								<Button
									size="small"
									type="primary"
									danger={!isInactive}
									icon={isInactive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
									onClick={() => onToggle(expenseConcept)}
								/>
							</Tooltip>
						</Space.Compact>
					</Col>
				)}
			</Row>

			<Divider style={{ padding: 2, margin: 5 }} />
		</>
	);
};

interface ListExpensesConceptsProps {
	active: boolean
	canManage: boolean
}

export const ListExpensesConcepts: FC<ListExpensesConceptsProps> = ({ active, canManage }) => {
	const { notification } = App.useApp();
	const queryClient = useQueryClient();
	const { resetStore } = useExpensesConceptsStore(state => state);

	const { expensesConcepts, isLoading, isRefetching } = getListExpensesConcepts(active);
	const toggleMutation = deleteExpenseConcept();

	const onToggle = (expenseConcept: ExpensesConcepts) => {
		toggleMutation.mutate(expenseConcept.id, {
			onSuccess: () => {
				notification.success({ message: `Concepto ${active ? 'desactivado' : 'activado'} correctamente` });
				void queryClient.invalidateQueries({ queryKey: [queryKeyExpensesConcepts.base, queryKeyDefault.list] });
				void queryClient.invalidateQueries({ queryKey: [queryKeyExpenses.base, queryKeyDefault.list], exact: false });
				resetStore();
			},
			onError: (error) => {
				notification.error({ message: handleError(error, `Ocurrió un error al ${active ? 'desactivar' : 'activar'} el concepto de gasto`) });
			},
		});
	};

	return (
		<List
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '600px' }}
			loading={isLoading || isRefetching}
			dataSource={expensesConcepts}
			locale={{ emptyText: active ? 'No hay conceptos activos' : 'No hay conceptos inactivos' }}
			renderItem={(item) => (
				<ListItem key={item.id} expenseConcept={item} canManage={canManage} isInactive={!active} onToggle={onToggle} />
			)}
		/>
	);
};
