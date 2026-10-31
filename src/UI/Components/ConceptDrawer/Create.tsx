import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { SaveOutlined } from '@ant-design/icons';
import { App, Button, Col, ColorPicker, Divider, Flex, Form, Input, Row, theme, Tooltip } from 'antd';
import { FC } from 'react';
import IconSelector from '../Fields/SelectIcon';
import { ExpensesConcepts } from '@/domain/ExpensesConcepts';
import { Color } from 'antd/es/color-picker';
import { handleError } from '@/infrastructure/utils/handleError';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeyDefault, queryKeyExpensesConcepts } from '@/constants/queryKeys';
import { useMutationType } from '@/infrastructure/querys/ExpenseConcepts';
import { ImCancelCircle } from 'react-icons/im';
import useExpensesConceptsStore from '@/infrastructure/context/ConceptsStore';

interface ConceptExpenseCreateProps {
	isCreating: boolean;
	setIsCreating?: (isCreating: boolean) => void;
	expenseConcept?: ExpensesConcepts
}

export const ConceptExpenseCreate: FC<ConceptExpenseCreateProps> = ({ isCreating, setIsCreating, expenseConcept }) => {
	const [form] = Form.useForm<Partial<ExpensesConcepts>>();
	const { token: { lime6 } } = theme.useToken();
	const { notification } = App.useApp();
	const queryClient = useQueryClient();

	const { brandId } = useUserStore(state => state.user);
	const { resetStore } = useExpensesConceptsStore(state => state);

	const createExpenseConceptMutation = useMutationType(expenseConcept?.id ? 'update' : 'create');

	const { isMobile } = useUserModeStore(state => state);

	const onFinish = (values: Partial<ExpensesConcepts>) => {
		const color = typeof values.color == 'string' ? values.color : (values.color as unknown as Color)?.toHexString();

		createExpenseConceptMutation.mutate({
			...expenseConcept,
			...values,
			color: color,
			brandId: brandId,
		}, {
			onSuccess: () => {
				notification.success({ message: `Concepto de gasto ${expenseConcept?.id ? 'actualizado' : 'creado'} correctamente` });
				form.resetFields();
				void queryClient.refetchQueries({
					queryKey: [queryKeyExpensesConcepts.base, queryKeyDefault.list],
				});
				resetStore();
				setIsCreating?.(false);
			}, 
			onError: (error) => {
				const messageError = handleError(error, `Ocurrió un error al ${expenseConcept?.id ? 'actualizar' : 'crear'} el concepto de gasto`);
				notification.error({ message: messageError });
			},
		});
	};

	if (!isCreating) return;

	return (
		<Form
			layout="vertical"
			form={form}
			onFinish={onFinish}
			initialValues={expenseConcept}
		>
			<Row gutter={8} justify={'center'} align={'middle'}>
				<Col xs={10} md={9.5}>
					<Form.Item
						label="Concepto"
						name={'concept'}
						rules={[{ required: true, message: 'Por favor ingrese el concepto' }]}
					>
						<Input placeholder="Concepto" />
					</Form.Item>
				</Col>
				<Col xs={5} md={8}>
					<Form.Item
						label="Icono"
						name={'keyIcon'}
						rules={[{ required: true, message: 'Por favor seleccione un icono' }]}
					>
						<IconSelector />
					</Form.Item>
				</Col>

				<Col xs={4} md={3}>
					<Form.Item
						label="Color"
						name={'color'}
						rules={[{ required: true, message: 'Por favor seleccione un color' }]}
					>
						<ColorPicker
							showText={false}
							format="hex"
							disabledAlpha
							disabledFormat
							defaultFormat="hex"
							style={{ marginLeft: isMobile ? '7px' : '10px' }}
						/>
					</Form.Item>
				</Col>

				<Col xs={5} md={3}>
					<Flex gap={5}>
						<Tooltip title="Guardar" color={lime6} >
							<Button
								size="small"
								icon={<SaveOutlined />}
								type="primary"
								htmlType="submit"
							/>
						</Tooltip>
						<Tooltip title="Cancelar" color={'red'} >
							<Button
								size="small"
								icon={<ImCancelCircle />}
								type="primary"
								onClick={() => { form.resetFields(); setIsCreating?.(false); }}
								danger
							/>
						</Tooltip>
					</Flex>

				</Col>
			</Row>

			<Divider style={{ marginTop:0 }} />
		</Form>
	);
};