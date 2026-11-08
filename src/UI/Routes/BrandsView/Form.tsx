import { spanConfigForm } from '@/constants/getSpan';
import { queryKeyBrands, queryKeyDefault } from '@/constants/queryKeys';
import routePaths from '@/constants/routePaths';
import { ruleRequired } from '@/constants/rules';
import { Brand } from '@/domain/Brand';
import useBrandStore from '@/infrastructure/context/BrandsStore';
import useLoading from '@/infrastructure/hooks/useLoading';
import { getBrand, useMutationType } from '@/infrastructure/querys/Brand';
import { handleError } from '@/infrastructure/utils/handleError';
import ActionsButton from '@/UI/Components/AcctionButtons';
import LoadingComponent from '@/UI/Components/LoadingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { App, Card, Col, Form, Input, InputNumber, Result, Row } from 'antd';
import { ExceptionStatusType } from 'antd/es/result';
import { AxiosError } from 'axios';
import { FC, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';

const FormBrand: FC<{ readonly?: boolean }> = ({ readonly = false }) => {
	const { id } = useParams();
	const [form] = Form.useForm<Partial<Brand>>();
	const resetBransStore = useBrandStore(state => state.resetStore);

	const { notification } = App.useApp();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { startLoading, stopLoading, isLoading } = useLoading();

	const { brand, isLoading: isLoadingBrand, isRefetching, isError, error: errorBrand } = getBrand(id);
	const brandMutation = useMutationType(id ? 'update' : 'create')?.();

	const [exit, setExit] = useState<boolean>(false);

	const isCreate = !id;

	const onFinish = (values: Partial<Omit<Brand, 'loansNumber'>>) => {
		startLoading();
		brandMutation.mutate({
			...brand,
			...values,
		}, {
			onSuccess: (response) => {
				const data = response?.data;
				notification.success({ message: `La marca ${isCreate ? 'creada' : 'actualizada'} exitosamente` });
				stopLoading();
				void resetBransStore();

				setExit(false);
				if (exit) {
					void queryClient.invalidateQueries({
						queryKey: [queryKeyBrands.base, queryKeyDefault.list],
						exact: false,
					});
					form.resetFields();
					void navigate(-1);
					return;
				}

				if (isCreate && data) {
					void navigate(`/${routePaths.DEFAULT_HOME}/${routePaths.BRANDS}/${data?.id}/editar`, { replace: true });
				}
			},
			onError: (error) => {
				stopLoading();
				notification.error({ message: handleError(error, `Ocurrió un error al ${isCreate ? 'crear' : 'actualizar'} la marca`) });
			},
		});
	};

	if (isLoadingBrand) {
		return <LoadingComponent label="Cargando marca" fullHeight />;
	}

	if (isError) {
		const axiosError = errorBrand as AxiosError;
		return (
			<Result
				status={axiosError.status as ExceptionStatusType ?? 500}
				title={handleError(errorBrand, 'Error al obtener la marca')}
				subTitle={axiosError.message ?? 'Error al obtener la marca'}
			/>
		);
	}

	return (
		<Card
			title={`${isCreate ? 'Crear' : readonly ? 'Ver' : 'Actualizar'} marca`}
			style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '84vh' }}
		>
			<Form
				form={form}
				layout="vertical"
				key={brand ? `${brand.id}-${brand.updatedAt}` : 'new'}
				initialValues={brand ? brand : {}}
				disabled={isRefetching || isLoading || readonly}
				onFinish={onFinish}
			>
				<Row gutter={[16, 0]}>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Nombre"
							name={'name'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Nombre de la marca" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Código"
							name={'code'}
							rules={[ ruleRequired ]}
						>
							<Input placeholder="Código de la marca" />
						</Form.Item>
					</Col>
					<Col {...spanConfigForm.medium}>
						<Form.Item
							label="Rutas disponibles"
							name={'routesAvailable'}
							rules={[ ruleRequired ]}
						>
							<InputNumber style={{ width: '100%' }} controls={false} precision={0} placeholder="Cantidad de rutas" />
						</Form.Item>
					</Col>
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
		</Card>
	);
};

export default FormBrand;