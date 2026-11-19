import { FC, ReactNode, useMemo, useState } from 'react';
import { Button, Drawer, Flex, Input, Tag, theme, Typography } from 'antd';
import {
	AlignLeftOutlined, BankOutlined, CalendarOutlined, CarOutlined, CheckCircleOutlined, CloseOutlined, HeartOutlined, MailOutlined,
	PhoneOutlined, PlusOutlined, PlusCircleOutlined, SearchOutlined, SolutionOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { CustomFieldDef } from '@/domain/Settings';
import useUserModeStore from '@/infrastructure/context/User/UserModeStore';
import { DEFAULT_FIELD_CATEGORY_LABEL, DEFAULT_FIELD_LIBRARY, DefaultFieldCategory, DefaultFieldPreset } from './defaultFields';
import { CUSTOM_FIELD_TYPE_LABEL } from './helpers';

interface DefaultFieldsDrawerProps {
	open: boolean
	/** Campos que ya tiene la marca (activos y archivados). */
	existing: CustomFieldDef[]
	onClose: () => void
	/** Abre el modal de crear con los datos del campo elegido. */
	onAdd: (preset: DefaultFieldPreset) => void
	/** Abre el modal de crear un campo desde cero. */
	onCreate: () => void
}

type Filter = 'todos' | DefaultFieldCategory;

/** Icono de cada campo de la biblioteca (los del mockup de Stitch). */
const PRESET_ICON: Record<string, ReactNode> = {
	correo: <MailOutlined />,
	telefono_alterno: <PhoneOutlined />,
	fecha_de_nacimiento: <CalendarOutlined />,
	ocupacion: <SolutionOutlined />,
	empresa: <BankOutlined />,
	observaciones: <AlignLeftOutlined />,
	estado_civil: <HeartOutlined />,
	tiene_vehiculo: <CarOutlined />,
};

const typeLabel = (preset: DefaultFieldPreset) => (preset.type === 'select' && preset.options
	? `Lista (${preset.options.length} opciones)`
	: CUSTOM_FIELD_TYPE_LABEL[preset.type]);

const CYAN_TINT = 'rgba(6, 182, 212, 0.12)';
const LIME_TINT = 'rgba(132, 204, 22, 0.12)';

/** Biblioteca de campos por defecto: buscar, filtrar por categoría y agregar uno. Los ya agregados se marcan. */
export const DefaultFieldsDrawer: FC<DefaultFieldsDrawerProps> = ({ open, existing, onClose, onAdd, onCreate }) => {
	const isMobile = useUserModeStore(store => store.isMobile);
	const { token } = theme.useToken();
	const [query, setQuery] = useState('');
	const [filter, setFilter] = useState<Filter>('todos');

	const takenKeys = useMemo(() => new Set(existing.map(item => item.key)), [existing]);

	const visible = useMemo(() => {
		const text = query.trim().toLowerCase();
		return DEFAULT_FIELD_LIBRARY.filter(item => (filter === 'todos' || item.category === filter)
			&& (!text || item.label.toLowerCase().includes(text) || item.description.toLowerCase().includes(text)));
	}, [query, filter]);

	const filters: Filter[] = ['todos', 'texto', 'contacto', 'seleccion'];

	const title = (
		<Flex vertical gap={0}>
			<Typography.Text strong style={{ fontSize: 18 }}>Agregar campo por defecto</Typography.Text>
			<Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>Elige uno y ajústalo antes de crearlo</Typography.Text>
		</Flex>
	);

	const footer = (
		<Flex vertical gap={10}>
			<Typography.Text style={{ fontSize: 13 }} type="secondary">¿Necesitas otro campo personalizado?</Typography.Text>
			<Button type="primary" block icon={<PlusCircleOutlined />} onClick={onCreate}>Crear campo desde cero</Button>
		</Flex>
	);

	return (
		<Drawer
			open={open}
			onClose={onClose}
			width={isMobile ? '100%' : 500}
			closable={false}
			title={title}
			extra={<Button type="text" shape="circle" icon={<CloseOutlined />} aria-label="Cerrar" onClick={onClose} />}
			footer={footer}
			destroyOnClose
			styles={{ header: { padding: '16px 20px' }, body: { padding: 20 }, footer: { padding: '14px 20px' } }}
		>
			<Flex vertical gap={16}>
				<Input
					allowClear
					size="large"
					prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
					placeholder="Buscar campo…"
					value={query}
					onChange={event => setQuery(event.target.value)}
					aria-label="Buscar campo"
				/>
				<Flex gap={8} wrap role="group" aria-label="Filtrar por categoría">
					{filters.map(item => {
						const active = filter === item;
						return (
							<Button
								key={item}
								shape="round"
								type={active ? 'primary' : 'default'}
								aria-pressed={active}
								onClick={() => setFilter(item)}
							>
								{item === 'todos' ? `Todos (${DEFAULT_FIELD_LIBRARY.length})` : DEFAULT_FIELD_CATEGORY_LABEL[item]}
							</Button>
						);
					})}
				</Flex>

				{visible.length === 0 && (
					<Typography.Text type="secondary">No hay campos que coincidan con la búsqueda.</Typography.Text>
				)}

				<Flex vertical gap={12}>
					{visible.map(preset => {
						const added = takenKeys.has(preset.key);
						const tinted = preset.category !== 'texto';
						return (
							<Flex
								key={preset.key}
								vertical
								gap={12}
								style={{ padding: 14, borderRadius: 12, border: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer, opacity: added ? 0.75 : 1 }}
							>
								<Flex align="center" gap={12}>
									<Flex
										align="center"
										justify="center"
										aria-hidden
										style={{ flex: 'none', width: 40, height: 40, borderRadius: 10, fontSize: 18, background: tinted ? CYAN_TINT : LIME_TINT, color: tinted ? token.colorInfo : token.colorPrimary }}
									>
										{PRESET_ICON[preset.key] ?? <UnorderedListOutlined />}
									</Flex>
									<Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
										<Flex justify="space-between" align="center" gap={8}>
											<Typography.Text strong ellipsis>{preset.label}</Typography.Text>
											<Tag bordered={false} color={tinted ? 'cyan' : undefined} style={{ margin: 0, flex: 'none' }}>{typeLabel(preset)}</Tag>
										</Flex>
										<Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>{preset.description}</Typography.Text>
									</Flex>
								</Flex>
								<Flex justify="space-between" align="center" gap={8}>
									{added
										? <Typography.Text type="secondary" style={{ fontSize: 12 }}><CheckCircleOutlined /> Ya agregado</Typography.Text>
										: <Typography.Text type="secondary" style={{ fontSize: 12 }}>{preset.hint ?? ''}</Typography.Text>}
									<Button
										icon={<PlusOutlined />}
										disabled={added}
										onClick={() => onAdd(preset)}
										aria-label={`Agregar ${preset.label}`}
									>
										Agregar
									</Button>
								</Flex>
							</Flex>
						);
					})}
				</Flex>
			</Flex>
		</Drawer>
	);
};

export default DefaultFieldsDrawer;
