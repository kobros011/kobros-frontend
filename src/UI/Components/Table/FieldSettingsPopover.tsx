import { HolderOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover, Typography, Space, Divider, Tag, theme } from 'antd';
import { FC, useState } from 'react';
import { FieldDef } from './fieldCatalog';
import { FieldPref } from '@/infrastructure/context/TableViewStore';

const { Text } = Typography;

interface FieldSettingsPopoverProps {
	title: string;
	fields: FieldDef[];
	prefs: FieldPref[];
	onChange: (prefs: FieldPref[]) => void;
	/** Solo icono (para espacios angostos, p. ej. la fila de tabs en móvil). */
	iconOnly?: boolean;
}

/**
 * Panel de checkboxes + arrastrar para reordenar, igual al panel "Fields" de Airtable
 * o "Properties" de Notion: controla qué columnas/campos se muestran y en qué orden.
 */
export const FieldSettingsPopover: FC<FieldSettingsPopoverProps> = ({ title, fields, prefs, onChange, iconOnly = false }) => {
	const [open, setOpen] = useState(false);
	const [dragKey, setDragKey] = useState<string | null>(null);
	const { token } = theme.useToken();

	const byKey = new Map(fields.map(field => [field.key, field]));
	const orderedPrefs = prefs.filter(pref => byKey.has(pref.key));

	const toggleVisible = (key: string) => {
		onChange(orderedPrefs.map(pref => (pref.key === key ? { ...pref, visible: !pref.visible } : pref)));
	};

	const reorder = (fromKey: string, toKey: string) => {
		if (fromKey === toKey) return;
		const next = [...orderedPrefs];
		const fromIndex = next.findIndex(pref => pref.key === fromKey);
		const toIndex = next.findIndex(pref => pref.key === toKey);
		if (fromIndex === -1 || toIndex === -1) return;
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		onChange(next);
	};

	const showAll = () => onChange(orderedPrefs.map(pref => ({ ...pref, visible: true })));
	const hideAll = () => onChange(orderedPrefs.map(pref => ({ ...pref, visible: false })));

	const content = (
		<div style={{ width: 300 }}>
			<Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
				<Text type="secondary" style={{ fontSize: 12 }}>Arrastra para reordenar</Text>
				<Space size={4}>
					<Button size="small" type="link" onClick={showAll}>Mostrar todo</Button>
					<Button size="small" type="link" onClick={hideAll}>Ocultar todo</Button>
				</Space>
			</Space>
			<Divider style={{ margin: '4px 0 8px' }} />
			<div style={{ maxHeight: 320, overflowY: 'auto' }}>
				{[
					{ label: 'Campos del cliente', items: orderedPrefs.filter(pref => !pref.key.startsWith('custom_')) },
					{ label: 'Campos personalizados', items: orderedPrefs.filter(pref => pref.key.startsWith('custom_')) },
				].filter(group => group.items.length > 0).map((group, index, groups) => (
					<div key={group.label} style={{ marginBottom: index < groups.length - 1 ? 8 : 0 }}>
						{groups.length > 1 && (
							<Text type="secondary" style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '4px 4px 6px' }}>
								{group.label}
							</Text>
						)}
						{group.items.map((pref) => {
							const field = byKey.get(pref.key);
							if (!field) return null;
							return (
								<div
									key={pref.key}
									draggable
									onDragStart={() => setDragKey(pref.key)}
									onDragOver={(event) => event.preventDefault()}
									onDrop={() => {
										if (dragKey) reorder(dragKey, pref.key);
										setDragKey(null);
									}}
									onDragEnd={() => setDragKey(null)}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										padding: '6px 4px',
										borderRadius: 6,
										cursor: 'grab',
										background: dragKey === pref.key ? token.colorFillTertiary : undefined,
									}}
								>
									<HolderOutlined style={{ color: token.colorTextTertiary }} />
									<Checkbox checked={pref.visible} onChange={() => toggleVisible(pref.key)} style={{ flex: 1 }}>
										{field.title}
									</Checkbox>
									{pref.key.startsWith('custom_') && <Tag color="success" bordered={false} style={{ margin: 0, fontSize: 11 }}>Personalizado</Tag>}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);

	return (
		<Popover
			title={title}
			trigger="click"
			open={open}
			onOpenChange={setOpen}
			content={content}
			placement="bottomRight"
		>
			<Button icon={<SettingOutlined />} aria-label={title}>{iconOnly ? null : title}</Button>
		</Popover>
	);
};

export default FieldSettingsPopover;
