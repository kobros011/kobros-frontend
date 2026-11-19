import { FC, DragEvent, ReactNode, useState } from 'react';
import { App, Badge, Button, Flex, Popconfirm, Space, Tag, theme, Tooltip, Typography } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, FilterOutlined, HolderOutlined, InboxOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { CustomFieldDef } from '@/domain/Settings';
import FormSection from './FormSection';
import { checkLimits, CUSTOM_FIELD_TYPE_LABEL, MAX_CUSTOM_FIELDS, MAX_FILTERABLE_FIELDS, normalizeFlags, reorder } from './helpers';

interface CustomFieldsCardProps {
	custom: CustomFieldDef[]
	onChange: (next: CustomFieldDef[]) => void
	/** Abre el modal de crear campo. */
	onCreate: () => void
	/** Abre la biblioteca de campos por defecto. */
	onAddDefault?: () => void
	/** Plural del módulo para los textos («clientes», «créditos»…). */
	plural?: string
	/** Abre el modal de editar campo. */
	onEdit: (key: string) => void
	/** Hay un guardado en curso: se bloquean las acciones para no mandar versiones desfasadas. */
	busy?: boolean
}

/** Atributos activos del campo, en orden. Solo se listan los que están encendidos (y «Oculto» si no es visible). */
const activeFlags = (item: CustomFieldDef): { key: string; label: string; color?: string; icon?: ReactNode }[] => [
	...(item.required ? [{ key: 'required', label: 'Requerido', color: 'error' }] : []),
	{ key: 'visible', label: item.visible ? 'Visible' : 'Oculto' },
	...(item.showInTable ? [{ key: 'table', label: 'Tabla' }] : []),
	...(item.showInCard ? [{ key: 'card', label: 'Tarjeta' }] : []),
	...(item.filterable ? [{ key: 'filter', label: 'Filtro', color: 'success', icon: <FilterOutlined /> }] : []),
];

/**
 * Campos personalizados: lista plana (sin tarjetas) con reordenar (arrastrar), editar, archivar y restaurar.
 * Archivar oculta el campo y conserva sus datos; desde archivados se puede restaurar o eliminar definitivamente
 * (esto último borra también sus valores en los clientes).
 */
export const CustomFieldsCard: FC<CustomFieldsCardProps> = ({ custom, onChange, onCreate, onAddDefault, onEdit, busy = false, plural = 'clientes' }) => {
	const { notification } = App.useApp();
	const { token } = theme.useToken();
	const [dragKey, setDragKey] = useState<string | null>(null);

	const indexOf = (key: string) => custom.findIndex(item => item.key === key);

	const moveTo = (fromKey: string, toKey: string) => {
		const from = indexOf(fromKey);
		const to = indexOf(toKey);
		if (from < 0 || to < 0 || from === to) return;
		onChange(reorder(custom, from, to));
	};

	const setArchived = (key: string, archived: boolean) => {
		const next = custom.map(item => (item.key === key ? normalizeFlags({ ...item, archived }) : item));
		const limit = checkLimits(next);
		if (limit) {
			notification.error({ message: limit });
			return;
		}
		onChange(next);
	};

	const removeForever = (key: string) => onChange(custom.filter(item => item.key !== key));

	const dragProps = (key: string) => ({
		draggable: true,
		onDragStart: (event: DragEvent) => {
			event.dataTransfer.effectAllowed = 'move';
			setDragKey(key);
		},
		onDragOver: (event: DragEvent) => event.preventDefault(),
		onDrop: (event: DragEvent) => {
			event.preventDefault();
			if (dragKey) moveTo(dragKey, key);
			setDragKey(null);
		},
		onDragEnd: () => setDragKey(null),
	});

	const header = (
		<Flex justify="space-between" align="center" gap={12} wrap style={{ width: '100%' }}>
			<Flex vertical gap={2}>
				<Typography.Text strong>Campos personalizados</Typography.Text>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					{custom.length} de {MAX_CUSTOM_FIELDS} campos · máx. {MAX_FILTERABLE_FIELDS} filtrables
				</Typography.Text>
			</Flex>
			<Space wrap>
				<Button type="primary" icon={<PlusOutlined />} onClick={onCreate} disabled={custom.length >= MAX_CUSTOM_FIELDS || busy}>Crear campo</Button>
				{onAddDefault && <Button icon={<AppstoreAddOutlined />} onClick={onAddDefault}>Por defecto</Button>}
			</Space>
		</Flex>
	);

	return (
		<FormSection header={header}>
			{custom.length === 0 && (
				<Typography.Text type="secondary">Aún no tienes campos personalizados.</Typography.Text>
			)}

			<Flex vertical>
				{custom.map(item => (
					<div
						key={item.key}
						className="kb-config-row kb-field-row"
						style={{
							borderBottom: `1px solid ${token.colorBorderSecondary}`,
							opacity: item.archived ? 0.6 : 1,
							background: dragKey === item.key ? token.colorFillTertiary : undefined,
						}}
						{...(busy ? {} : dragProps(item.key))}
					>
						<Flex align="center" gap={8} className="kb-field-name">
							<HolderOutlined aria-hidden style={{ color: token.colorTextTertiary, cursor: busy ? 'default' : 'grab' }} />
							<Typography.Text strong={!item.archived} delete={item.archived} ellipsis style={{ minWidth: 0 }}>{item.label}</Typography.Text>
							<Typography.Text code style={{ fontSize: 11 }}>{item.key}</Typography.Text>
						</Flex>

						<Flex align="center" gap={8} wrap className="kb-field-meta">
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>{CUSTOM_FIELD_TYPE_LABEL[item.type]}</Typography.Text>
							<Badge status={item.archived ? 'default' : 'success'} text={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.archived ? 'Archivado' : 'Activo'}</Typography.Text>} />
						</Flex>

						<Flex gap={4} wrap className="kb-field-chips">
							{!item.archived && activeFlags(item).map(flag => (
								<Tag key={flag.key} color={flag.color} icon={flag.icon} bordered={false} style={{ margin: 0 }}>{flag.label}</Tag>
							))}
						</Flex>

						<Space size={4} className="kb-field-actions">
							<Tooltip title="Editar">
								<Button type="text" icon={<EditOutlined />} aria-label={`Editar ${item.label}`} onClick={() => onEdit(item.key)} disabled={item.archived || busy} />
							</Tooltip>
							{item.archived ? (
								<>
									<Tooltip title="Restaurar">
										<Button type="text" icon={<UndoOutlined />} aria-label={`Restaurar ${item.label}`} onClick={() => setArchived(item.key, false)} disabled={busy} />
									</Tooltip>
									<Popconfirm
										title={`¿Eliminar «${item.label}» definitivamente?`}
										description={`Se borrarán también sus valores en todos los ${plural}. No se puede deshacer.`}
										okText="Eliminar"
										cancelText="Cancelar"
										okButtonProps={{ danger: true }}
										cancelButtonProps={{ type: 'primary', danger: true, ghost: true }}
										onConfirm={() => removeForever(item.key)}
										disabled={busy}
									>
										<Tooltip title="Eliminar definitivamente">
											<Button type="text" danger icon={<DeleteOutlined />} aria-label={`Eliminar definitivamente ${item.label}`} disabled={busy} />
										</Tooltip>
									</Popconfirm>
								</>
							) : (
								<Tooltip title="Archivar">
									<Button type="text" icon={<InboxOutlined />} aria-label={`Archivar ${item.label}`} onClick={() => setArchived(item.key, true)} disabled={busy} />
								</Tooltip>
							)}
						</Space>
					</div>
				))}
			</Flex>

			{custom.length > 0 && (
				<Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8 }}>
					Un campo archivado se puede restaurar o eliminar definitivamente.
				</Typography.Text>
			)}
		</FormSection>
	);
};

export default CustomFieldsCard;
