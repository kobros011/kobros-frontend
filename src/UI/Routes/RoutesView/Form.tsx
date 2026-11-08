import { spanConfigForm } from '@/constants/getSpan';
import { queryKeyRoutes, queryKeyDefault } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { ruleRequired } from '@/constants/rules';
import { TypeUser } from '@/constants/types';
import { Route } from '@/domain/Route';
import useRouteStore from '@/infrastructure/context/RoutesStore';
import useUserStore from '@/infrastructure/context/User/UserDataStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getRoute, useMutationType } from '@/infrastructure/querys/Route';
import { handleError } from '@/infrastructure/utils/handleError';
import ActionsButton from '@/UI/Components/AcctionButtons';
import InputDate from '@/UI/Components/Fields/InputDate';
import InputNumber from '@/UI/Components/Fields/InputNumber';
import { SelectBrand } from '@/UI/Components/Fields/SelectBrand';
import { SelectUsers } from '@/UI/Components/Fields/SelectUsers';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Card, Col, Form, Input, Result, Row } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const FormRoute: FC<{ readonly?: boolean, bare?: boolean }> = ({ readonly = false, bare = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Route>>();
	const resetRouteStore = useRouteStore(state => state.resetStore);

	const { typeUser, brandId } = useUserStore(state => state.user);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { route, isLoading: isLoadingRoute, isRefetching, isError, refetch, error: errorRoute  } = getRoute(id);
	const routeMutation = useMutationType(id ? 'update' : 'create')?.();

	const [exit, setExit] = useState<boolean>(false);

	const isCreate = !id;

	const onFinish = (values: Partial<Route>) => {
		startLoading();
		routeMutation.mutate({
			...route,
			...values,
			brandId: values.brandId ? values.brandId : brandId,
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				notification.success({ message: `La ruta fue ${isCreate ? 'creada' : 'actualizada'} exitosamente` });
				void resetRouteStore();

				if (!isCreate) {
					void refetch();
				}

				stopLoading();

				if (exit) {
					void queryClient.invalidateQueries({
						queryKey: [queryKeyRoutes.base, queryKeyDefault.list],
						exact: false,
					});
					setExit(false);
					void navigate(-1);
					return;
				}

				if (isCreate && data) {
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.ROUTES}/${data?.id}/editar`, { replace: true });
				}
			},
			onError: (error) => {
				stopLoading();
				notification.error({ message: handleError(error, `Ocurrió un error al ${isCreate ? 'creada' : 'actualizar'} la ruta`) });
			},
		});
	};

	const isSuperUser = typeUser == TypeUser.dev;

	if (isLoadingRoute) {
		return <LoadingComponent label="Cargando ruta" fullHeight />;
	}

	if (isError) {
		const axiosError = errorRoute as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorRoute, 'Error al obtener la ruta')}
				subTitle={axiosError.message ?? 'Error al obtener la ruta'}
			/>
		);
	}

	const content = (
		<>
			<Form
				form={form}
				layout="vertical"
				key={route ? `${route.id}-${route.updatedAt}` : 'new'}
				initialValues={route ? route : {}}
				disabled={isRefetching || isLoading || readonly}
				onFinish={onFinish}
				preserve={false}
			>
				<Row gutter={[16, 0]}>
					{isSuperUser && <Col {...spanConfigForm.medium}>
						<Form.Item
							label="Marca"
							name='brandId'
							rules={[ ruleRequired ]}
						>
							<SelectBrand disabled={readonly || !isCreate} placeholder={'Marca de la ruta'} />
						</Form.Item>
					</Col>}
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Nombre"
							name={'name'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Nombre de la ruta" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Valor inicial"
							name={'initialValue'}
							rules={[ ruleRequired ]}
						>
							<InputNumber thousandsSeparator placeholder="Valor inicial" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm[isSuperUser ? 'medium' : 'small']}>
						<Form.Item
							label="Gastos iniciales"
							name={'initialExpense'}
							rules={[ ruleRequired ]}
						>
							<InputNumber thousandsSeparator placeholder="Gastos iniciales" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.small} >
						<Form.Item
							label="Fecha de apertura"
							name={'openingDate'}
							rules={[ ruleRequired ]}
						>
							<InputDate useCurrentDate placeholder="Fecha de apertura" />
						</Form.Item>
					</Col>
					{[TypeUser.super, TypeUser.dev].includes(typeUser) && 
						<Col {...spanConfigForm.medium} >
							<Form.Item
								noStyle
								shouldUpdate={(prev: Partial<Route>, curr) => prev?.brandId != curr?.brandId}
							>
								{({ getFieldValue }) => {
									const selectBraid = getFieldValue('brandId') as string;

									return (
										<Form.Item
											label="Usuarios asociados"
											name={'allowedUsersIds'}
											tooltip='Usuarios que tiene acceso a esta ruta'
										>
											<SelectUsers branId={brandId ?? selectBraid} perType placeholder='Usuarios que tiene acceso a esta ruta' mode='multiple' />
										</Form.Item>
									);
								}}
							</Form.Item>
						</Col>
					}
				</Row>
			</Form>

			<ActionsButton
				textAction={id ? 'Actualizar' : 'Crear'}
				hiddenSave={readonly}
				hiddenSaveAndExit={readonly}
				isLoading={isRefetching || isLoading}
				onClickCancel={() => void navigate(-1)}
				onClickSave={form.submit}
				onClickSaveExit={() => { form.submit(); setExit(true); }}
			/>
		</>
	);

	if (bare) {
		return content;
	}

	return (
		<Card
			title={`${isCreate ? 'Crear' : readonly ? 'Ver' : 'Actualizar'} ruta`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			{content}
		</Card>
	);
};

export default FormRoute;