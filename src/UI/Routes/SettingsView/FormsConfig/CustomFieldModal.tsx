import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Flex, Input, Modal, Switch, theme, Typography } from 'antd';
import {
	AlignLeftOutlined, CalendarOutlined, CheckCircleOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, DollarOutlined,
	ExclamationCircleFilled, HolderOutlined, LockOutlined, MailOutlined, NumberOutlined, PhoneOutlined, PlusOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { CustomFieldDef, CustomFieldType, FormModule } from '@/domain/Settings';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { buildFieldKey, CUSTOM_FIELD_TYPE_LABEL, MAX_LABEL_LENGTH, MAX_OPTIONS, MODULE_COPY, normalizeFlags, RESERVED_BY_MODULE, validateCustomField } from './helpers';

export type CustomFieldEditorState =
	| { mode: 'create'; preset?: Partial<CustomFieldDef> }
	| { mode: 'edit'; field: CustomFieldDef };

interface CustomFieldModalProps {
	/** Módulo al que pertenece el campo (cambia los textos y las claves reservadas). */
	module?: FormModule
	state: CustomFieldEditorState | null
	/** Todos los campos de la marca (activos y archivados): la clave no puede repetirse. */
	existing: CustomFieldDef[]
	onSave: (field: CustomFieldDef) => void
	onClose: () => void
	/** El guardado está en curso: se bloquea el cierre y el botón muestra carga. */
	saving?: boolean
}

const TYPES: CustomFieldType[] = ['text', 'number', 'money', 'email', 'phone', 'date', 'select', 'boolean'];

/** Icono de cada tipo de campo (los mismos del mockup de Stitch). */
const TYPE_ICON: Record<CustomFieldType, ReactNode> = {
	text: <AlignLeftOutlined />,
	number: <NumberOutlined />,
	money: <DollarOutlined />,
	email: <MailOutlined />,
	phone: <PhoneOutlined />,
	date: <CalendarOutlined />,
	select: <UnorderedListOutlined />,
	boolean: <CheckCircleOutlined />,
};

const emptyDraft = (preset?: Partial<CustomFieldDef>): CustomFieldDef => ({
	key: '',
	label: preset?.label ?? '',
	type: preset?.type ?? 'text',
	required: preset?.required ?? false,
	visible: preset?.visible ?? true,
	archived: false,
	options: preset?.options ?? [],
	showInTable: preset?.showInTable ?? false,
	showInCard: preset?.showInCard ?? false,
	filterable: preset?.filterable ?? false,
});

/** Los errores que hablan de la lista de opciones se muestran dentro de su panel; el resto, bajo la etiqueta. */
const isOptionsError = (message: string) => /lista|opci[oó]n|opciones/i.test(message);

const LIME_TINT = 'rgba(132, 204, 22, 0.12)';

const SectionLabel: FC<{ children: ReactNode; extra?: ReactNode }> = ({ children, extra }) => (
	<Flex justify="space-between" align="center">
		<Typography.Text strong>{children}</Typography.Text>
		{extra}
	</Flex>
);

const InlineError: FC<{ messages: string[] }> = ({ messages }) => {
	const { token } = theme.useToken();
	if (messages.length === 0) return null;
	return (
		<Flex align="center" gap={8} role="alert" style={{ padding: '8px 12px', borderRadius: 8, color: token.colorError, background: 'rgba(239, 68, 68, 0.10)', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: 13 }}>
			<ExclamationCircleFilled aria-hidden />
			<span>{messages.join('. ')}</span>
		</Flex>
	);
};

const SwitchRow: FC<{ label: string; help: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }> = ({ label, help, checked, disabled, onChange }) => {
	const { token } = theme.useToken();
	return (
		<Flex justify="space-between" align="center" gap={12} style={{ minHeight: 44, padding: '10px 14px', border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 8, background: token.colorBgContainer }}>
			<Flex vertical gap={0} style={{ minWidth: 0 }}>
				<Typography.Text>{label}</Typography.Text>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>{help}</Typography.Text>
			</Flex>
			<Switch aria-label={label} checked={checked} disabled={disabled} onChange={onChange} />
		</Flex>
	);
};

/** Crear o editar un campo personalizado. El tipo y la clave no cambian después de creado. */
export const CustomFieldModal: FC<CustomFieldModalProps> = ({ state, existing, onSave, onClose, saving = false, module = 'clients' }) => {
	const copy = MODULE_COPY[module];
	const reserved = RESERVED_BY_MODULE[module];
	const isMobile = useUserModeStore(store => store.isMobile);
	const { token } = theme.useToken();
	const isEdit = state?.mode === 'edit';
	const [draft, setDraft] = useState<CustomFieldDef>(emptyDraft());
	const [showErrors, setShowErrors] = useState(false);

	useEffect(() => {
		if (!state) return;
		setShowErrors(false);
		setDraft(state.mode === 'edit' ? state.field : emptyDraft(state.preset));
	}, [state]);

	const otherFields = useMemo(
		() => existing.filter(item => !(state?.mode === 'edit' && item.key === state.field.key)),
		[existing, state],
	);

	// La clave se genera desde la etiqueta solo al crear; al editar se conserva.
	const generatedKey = useMemo(
		() => (isEdit ? draft.key : buildFieldKey(draft.label, existing.map(item => item.key), reserved)),
		[isEdit, draft.key, draft.label, existing, reserved],
	);
	const keyForValidation = isEdit ? draft.key : generatedKey;
	const errors = useMemo(
		() => (state ? validateCustomField({ ...draft, key: keyForValidation }, otherFields, { isNew: !isEdit, reserved }) : []),
		[state, draft, keyForValidation, otherFields, isEdit, reserved],
	);
	const labelErrors = showErrors ? errors.filter(message => !isOptionsError(message)) : [];
	const optionErrors = showErrors ? errors.filter(isOptionsError) : [];

	const update = (patch: Partial<CustomFieldDef>) => setDraft(current => ({ ...current, ...patch }));
	const setFlag = (patch: Partial<CustomFieldDef>) => setDraft(current => normalizeFlags({ ...current, ...patch }));

	const options = draft.options;
	const setOption = (index: number, value: string) => update({ options: options.map((item, i) => (i === index ? value : item)) });
	const removeOption = (index: number) => update({ options: options.filter((_, i) => i !== index) });
	const addOption = () => {
		if (options.length < MAX_OPTIONS) update({ options: [...options, ''] });
	};

	const handleSave = () => {
		setShowErrors(true);
		if (errors.length > 0) return;
		const cleanOptions = draft.type === 'select' ? options.map(option => option.trim()).filter(Boolean) : [];
		const field: CustomFieldDef = normalizeFlags({
			...draft,
			key: keyForValidation,
			label: draft.label.trim(),
			options: cleanOptions,
		});
		onSave(field);
	};

	const body = state ? (
		<Flex vertical gap={20}>
			<Flex vertical gap={6}>
				<SectionLabel extra={<Typography.Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{draft.label.length}/{MAX_LABEL_LENGTH}</Typography.Text>}>
					Etiqueta <span style={{ color: token.colorError }}>*</span>
				</SectionLabel>
				<Input
					size="large"
					value={draft.label}
					maxLength={MAX_LABEL_LENGTH}
					placeholder="Ejemplo: Correo"
					status={labelErrors.length > 0 ? 'error' : undefined}
					onChange={event => update({ label: event.target.value })}
					aria-label="Etiqueta del campo"
					autoFocus
				/>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>Es el nombre que verá el usuario en el formulario y en las tablas.</Typography.Text>
				<InlineError messages={labelErrors} />
			</Flex>

			<Flex vertical gap={6}>
				<SectionLabel>Clave</SectionLabel>
				<Input
					size="large"
					value={generatedKey}
					disabled
					suffix={<LockOutlined aria-hidden style={{ color: token.colorTextTertiary }} />}
					style={{ fontFamily: 'monospace' }}
					placeholder="campo"
					aria-label="Clave generada"
				/>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					{isEdit ? 'La clave no se puede cambiar después de crear el campo.' : 'Se genera sola a partir de la etiqueta y no se puede cambiar después.'}
				</Typography.Text>
			</Flex>

			<Flex vertical gap={8}>
				<SectionLabel extra={<Typography.Text type="secondary" style={{ fontSize: 12 }}>Inmutable tras creación</Typography.Text>}>Tipo de campo</SectionLabel>
				<div
					role="radiogroup"
					aria-label="Tipo de campo"
					style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: 8 }}
				>
					{TYPES.map(type => {
						const selected = draft.type === type;
						return (
							<button
								key={type}
								type="button"
								role="radio"
								aria-checked={selected}
								disabled={isEdit}
								onClick={() => update({ type, options: type === 'select' ? draft.options : [] })}
								style={{
									position: 'relative',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 6,
									minHeight: 76,
									borderRadius: 8,
									cursor: isEdit ? 'default' : 'pointer',
									border: `${selected ? 2 : 1}px solid ${selected ? token.colorPrimary : token.colorBorder}`,
									background: selected ? LIME_TINT : token.colorBgContainer,
									color: selected ? token.colorPrimary : token.colorText,
									fontWeight: selected ? 600 : 400,
									opacity: isEdit && !selected ? 0.5 : 1,
									transition: 'border-color 0.15s, background 0.15s',
								}}
							>
								<span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>{TYPE_ICON[type]}</span>
								<span style={{ fontSize: 13 }}>{CUSTOM_FIELD_TYPE_LABEL[type]}</span>
								{selected && <span aria-hidden style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: token.colorPrimary }} />}
							</button>
						);
					})}
				</div>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					El tipo no se puede cambiar después; si necesitas otro, archiva este campo y crea uno nuevo.
				</Typography.Text>
			</Flex>

			{draft.type === 'select' && (
				<Flex vertical gap={10} style={{ padding: 14, borderRadius: 8, border: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer }}>
					<SectionLabel extra={<Typography.Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{options.length} de {MAX_OPTIONS} opciones</Typography.Text>}>
						Opciones de la lista
					</SectionLabel>
					{options.map((option, index) => (
						<Flex key={index} gap={8} align="center">
							<HolderOutlined aria-hidden style={{ color: token.colorTextTertiary }} />
							<Input value={option} onChange={event => setOption(index, event.target.value)} placeholder={`Opción ${index + 1}`} aria-label={`Opción ${index + 1}`} />
							<Button type="text" icon={<DeleteOutlined />} aria-label={`Quitar opción ${index + 1}`} onClick={() => removeOption(index)} />
						</Flex>
					))}
					<Button
						type="dashed"
						block
						icon={<PlusOutlined />}
						onClick={addOption}
						disabled={options.length >= MAX_OPTIONS}
						style={{ color: token.colorPrimary }}
					>
						Agregar opción
					</Button>
					<InlineError messages={optionErrors} />
				</Flex>
			)}

			<Flex vertical gap={8}>
				<Typography.Text strong style={{ fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: token.colorTextSecondary }}>
					Reglas y visibilidad
				</Typography.Text>
				<SwitchRow label="Requerido" help={`Obligatorio para guardar el ${copy.singular}`} checked={draft.required} disabled={!draft.visible || draft.archived} onChange={required => setFlag({ required })} />
				<SwitchRow label="Visible en formularios" help={`Aparece al crear o editar un ${copy.singular}`} checked={draft.visible} onChange={visible => setFlag({ visible })} />
				<SwitchRow label="Mostrar como columna en la tabla" help={`Visible en la tabla de ${copy.plural} en escritorio`} checked={draft.showInTable} onChange={showInTable => setFlag({ showInTable })} />
				<SwitchRow label="Mostrar en las tarjetas" help="Visible en la vista de tarjetas del móvil" checked={draft.showInCard} onChange={showInCard => setFlag({ showInCard })} />
				{/* Rutas no tiene filtros de búsqueda por campo. */}
				{module !== 'routes' && <SwitchRow label="Permitir filtrar" help="Disponible en los filtros de búsqueda (máximo 5)" checked={draft.filterable} onChange={filterable => setFlag({ filterable })} />}
			</Flex>
		</Flex>
	) : null;

	const footer = (
		<Flex justify="flex-end" gap={8} vertical={isMobile} style={isMobile ? { alignItems: 'stretch' } : undefined}>
			<Button type="primary" danger ghost block={isMobile} onClick={onClose} disabled={saving}>Cancelar</Button>
			<Button type="primary" block={isMobile} icon={isEdit ? <CheckOutlined /> : <PlusOutlined />} onClick={handleSave} loading={saving}>
				{isEdit ? 'Guardar cambios' : 'Crear campo'}
			</Button>
		</Flex>
	);

	// Encabezado del mockup: X a la izquierda, título y una línea que dice a qué formulario pertenece el campo.
	const title = (
		<Flex align="center" gap={12}>
			<Button type="text" shape="circle" icon={<CloseOutlined />} aria-label="Cerrar" onClick={onClose} disabled={saving} />
			<Flex vertical gap={0} style={{ minWidth: 0 }}>
				<Typography.Text strong style={{ fontSize: 16 }}>{isEdit ? 'Editar campo personalizado' : 'Crear campo personalizado'}</Typography.Text>
				{!isMobile && <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>Formulario de {copy.title} · Atributos adicionales</Typography.Text>}
			</Flex>
		</Flex>
	);

	if (isMobile) {
		return (
			<Drawer
				open={!!state}
				onClose={onClose}
				placement="bottom"
				height="100%"
				closable={false}
				title={title}
				footer={footer}
				destroyOnClose
				styles={{ header: { padding: '12px 16px' }, body: { padding: 16 }, footer: { padding: 16 } }}
				style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
			>
				{body}
			</Drawer>
		);
	}

	return (
		<Modal
			open={!!state}
			onCancel={onClose}
			closable={false}
			title={title}
			footer={footer}
			width={640}
			destroyOnClose
			styles={{ header: { padding: '16px 24px', borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 0 }, body: { padding: 24, maxHeight: '70vh', overflowY: 'auto' }, footer: { padding: '16px 24px', borderTop: `1px solid ${token.colorBorderSecondary}`, marginTop: 0 } }}
		>
			{body}
		</Modal>
	);
};

export default CustomFieldModal;
