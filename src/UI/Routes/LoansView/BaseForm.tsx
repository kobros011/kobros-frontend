import { LoanFull } from '@/domain/Loan';
import { PaymentMethod } from '@/constants/types';
import { ConfigProvider, Form, FormInstance, Table } from 'antd';
import { FieldData } from 'rc-field-form/lib/interface';
import { FC, ReactNode } from 'react';
import { FieldDateTable, FieldMethodTable, FieldNumberTable, FieldOrderTable, FieldTextTable } from '@/UI/Components/Fields/MultiFieldsFormItem';
import { ruleRequired } from '@/constants/rules';

interface BaseFormLoanProps {
	onFinish?: (values: Partial<LoanFull>) => void
	getInitialValues?: () => void
	form: FormInstance<Partial<LoanFull>>
	disabled: boolean
	onFieldsChange?: (changedFields: FieldData<LoanFull>[]) => void
	clientId?: string
	routeId?: string
	hasReadOnly?: boolean
}

const BaseFormLoan: FC<BaseFormLoanProps> = ({ clientId, routeId, ...props }) => {

	const paymentMethod = Form.useWatch('paymentMethod', props.form);
	const isFixedDate = paymentMethod === PaymentMethod.fixedDate;

	const items = [
		{
			label: 'Cédula del cliente (DNI):',
			descriptions: <FieldTextTable readOnly name={'idDocument'} />,
		},
		{
			label: 'Nombre del cliente:',
			descriptions: <FieldTextTable readOnly name={'fullName'} />,
		},
		{
			label: 'Dirección:',
			descriptions: <FieldTextTable readOnly={props.hasReadOnly} placeholder='Dirección del cliente' name={'currentAddress'} />,
		},
		{
			label: 'Celular:',
			descriptions: <FieldTextTable readOnly={props.hasReadOnly} placeholder='Celular del cliente' name={'currentMobile'} />,
		},
		{
			label: 'Ruta del cliente:',
			descriptions: <FieldTextTable readOnly name={'routeName'} />,
		},
		{
			label: 'Prioridad actual:',
			descriptions: <FieldTextTable readOnly name={'order'} />,
		},

		{
			label: 'Crédito No:',
			descriptions: <FieldTextTable readOnly name={'loanNumber'} />,
		},
		{
			label: 'Fecha inicial:',
			descriptions: <FieldDateTable useCurrentDate readOnly name={'initialDate'} />,
		},
		{
			label: 'Fecha final:',
			descriptions: <FieldDateTable useCurrentDate readOnly name={'endDate'} />,
		},
		{
			label: 'Valor capital:',
			descriptions: <FieldNumberTable readOnly={props.hasReadOnly} thousandsSeparator name={'valueCapital'} />,
		},
		{
			label: 'Valor cuota fija:',
			descriptions: <FieldNumberTable readOnly={props.hasReadOnly} thousandsSeparator name={'valueQuotaFixed'} />,
		},
		{
			label: 'Cuotas pactadas:',
			descriptions: <FieldNumberTable readOnly={props.hasReadOnly} precision={0} name={'agreedQuotas'} />,
		},
		{
			label: 'Fecha 1ra cuota a pagar:',
			descriptions: <FieldDateTable useCurrentDate readOnly name={'dateFirstQuota'} />,
		},
		{
			label: 'Forma de pago:',
			descriptions: <FieldMethodTable readOnly={props.hasReadOnly}  name={'paymentMethod'} />,
		},
		...(isFixedDate ? [{
			label: 'Día del mes:',
			descriptions: <FieldNumberTable
				name={'fixedPaymentDay'}
				readOnly={props.hasReadOnly}
				precision={0}
				min={1}
				max={31}
				rules={[ruleRequired]}
			/>,
		}] : []),
		{
			label: '',
			descriptions: <FieldTextTable name='' readOnly />,
		},
		{
			label: 'Saldo capital préstamo:',
			descriptions: <FieldNumberTable readOnly thousandsSeparator name={'valueCapital'} />,
		},
		{
			label: 'Saldo utilidad préstamo:',
			descriptions: <FieldNumberTable readOnly thousandsSeparator name={'valueUtilityLoan'} />,
		},
		{
			label: 'Saldo préstamo + utilidad:',
			descriptions: <FieldNumberTable readOnly thousandsSeparator name={'valueTotalLoan'} />,
		},
		{
			label: 'Plazo del préstamo:',
			descriptions: <FieldTextTable readOnly name={'daysLoan'} />,
		},
		{
			label: 'Tasa de interés:',
			descriptions: <FieldNumberTable suffix='%' readOnly precision={4} thousandsSeparator name={'interestRate'} />,
		},

		{
			label: 'Total deuda:',
			descriptions: <FieldNumberTable readOnly thousandsSeparator name={'totalLoan'} />,
		},

	];

	if (props.hasReadOnly) {
		items.splice(20, 0, ...[
			{
				label: 'Cuotas pendientes:',
				descriptions: <FieldNumberTable readOnly precision={0} name={'pendingQuotas'} />,
			},
			{
				label: 'Cuotas canceladas:',
				descriptions: <FieldNumberTable readOnly precision={0} name={'canceledQuotas'} />,
			},
			{
				label: 'Total en mora:',
				descriptions: <FieldNumberTable readOnly thousandsSeparator name={'totalDefault'} />,
			},
		],
		);
	}

	if (!props.hasReadOnly) {
		items.splice(7, 0, {
			label: 'Nueva prioridad:',
			descriptions: <FieldOrderTable clientId={clientId ?? ''} routeId={routeId} name={'newOrder'} />,
		});

		items.push(...[
			{
				label: '',
				descriptions: <FieldTextTable name='' readOnly />,
			},
			{
				label: 'Valor pagado hoy:',
				descriptions: <FieldNumberTable thousandsSeparator name={'valuePayment'} />,
			},
		]);
	}

	return (
		<ConfigProvider
			theme={{
				components: {
					Table: {
						lineHeight: 0,
						borderRadius: 0,
						headerBorderRadius: 0,
						fontSize: 13,
						padding: 2,
					},
					Input: {
						fontSize: 13,
						borderRadius: 0,
					},
					InputNumber: {
						fontSize: 13,
						borderRadius: 0,
						paddingBlock: 0,
						paddingInline: 0,
					},
					DatePicker: {
						fontSize: 13,
						borderRadius: 0,
					},
					Select: {
						optionFontSize: 13,
						fontSize: 13,
						borderRadius: 0,
						paddingContentVertical: 0,
						padding: 0,
						paddingContentHorizontal: 0,
					},
				},
			}}
		>
			<Form<Partial<LoanFull>>
				form={props.form}
				layout="vertical"
				disabled={props.disabled}
				onFinish={props.onFinish}
				initialValues={() => props?.getInitialValues?.()}
				onFieldsChange={(changedFields: FieldData<LoanFull>[]) => props?.onFieldsChange?.(changedFields)}
			>
				<Table<{ descriptions: ReactNode, label: string }>
					bordered
					showHeader={false}
					pagination={false}
					dataSource={items}
					columns={[{ key: '1',  dataIndex: 'label' }, { key: '2', dataIndex: 'descriptions' }]}
					style={{ marginBottom: 10 }}
					indentSize={24}
				/>
			</Form>
		</ConfigProvider>
	);
};

export default BaseFormLoan;