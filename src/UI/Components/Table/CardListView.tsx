import {
	CalendarOutlined,
	DollarCircleOutlined,
	EnvironmentOutlined,
	IdcardOutlined,
	PhoneOutlined,
	TagOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Empty, Flex, Pagination, Row, Skeleton, Tag, Typography, theme } from 'antd';
import { CSSProperties, KeyboardEvent, ReactNode, useState } from 'react';
import { FieldDef } from './fieldCatalog';
import { FieldPref } from '@/infrastructure/context/TableViewStore';
import { IRecord, ServerPagination } from './types';
import { PAGE_SIZE_OPTIONS } from '@/domain/Pagination';

const { Text, Title } = Typography;

interface CardListViewProps<T extends IRecord> {
	dataSource?: readonly T[];
	fields: FieldDef[];
	prefs: FieldPref[];
	titleField?: keyof T;
	isLoading?: boolean;
	renderActions?: (record: T) => ReactNode;
	/** Abre el detalle del registro; si se provee, toda la tarjeta queda clicable y navegable con teclado. */
	onCardClick?: (record: T) => void;
	/** Píldora del pie de tarjeta (ej. conteo de créditos del cliente). Solo se muestra si el módulo tiene un dato real que mostrar. */
	footerBadge?: (record: T) => ReactNode;
	/** Paginación del servidor: `dataSource` ya es la página actual. Sin ella se pagina en el cliente. */
	pagination?: ServerPagination;
	isMobile?: boolean;
}

const AVATAR_COLORS = ['#7C5CFC', '#17A673', '#D68910', '#2E86DE', '#C2185B', '#0097A7'];
const PAGE_SIZE = 12;
const SKELETON_COUNT = 6;

type FieldRole = 'date' | 'phone' | 'location' | 'money' | 'id' | 'status' | 'generic';

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Rol inferido por el nombre del campo: decide el ícono, si agrupa como ubicación/teléfono y si puede ser la píldora de estado. */
const getFieldRole = (key: string, dataIndex: string): FieldRole => {
	const hint = `${key}${dataIndex}`.toLowerCase();
	if (hint.includes('status') || hint.includes('estado') || hint.includes('paymentmethod') || hint.includes('metodo')) return 'status';
	if (hint.includes('date') || hint.includes('fecha')) return 'date';
	if (hint.includes('phone') || hint.includes('mobile') || hint.includes('telefono') || hint.includes('celular')) return 'phone';
	if (hint.includes('address') || hint.includes('route') || hint.includes('city') || hint.includes('neighborhood') || hint.includes('direccion') || hint.includes('barrio') || hint.includes('ruta') || hint.includes('department') || hint.includes('depart')) return 'location';
	if (hint.includes('value') || hint.includes('price') || hint.includes('capital') || hint.includes('valor') || hint.includes('precio')) return 'money';
	if (hint.includes('document') || hint.includes('cedula') || hint.includes('id')) return 'id';
	return 'generic';
};

const ROLE_ICON: Record<FieldRole, ReactNode> = {
	date: <CalendarOutlined />,
	phone: <PhoneOutlined />,
	location: <EnvironmentOutlined />,
	money: <DollarCircleOutlined />,
	id: <IdcardOutlined />,
	status: <TagOutlined />,
	generic: <TagOutlined />,
};

/**
 * Agrupa los campos en bloques: dos campos consecutivos del mismo rol (ej. dirección + barrio,
 * ambos "location") se combinan en un bloque con línea secundaria, porque la segunda línea
 * sigue siendo "lo mismo" que la primera. Campos de rol distinto NUNCA se combinan — cada uno
 * es su propio bloque con su propia etiqueta, para no mostrar un número sin explicar qué es.
 */
const buildInfoBlocks = (infoFields: FieldDef[]) => {
	const blocks: { primary: FieldDef; secondary?: FieldDef }[] = [];
	for (let i = 0; i < infoFields.length; i += 1) {
		const current = infoFields[i];
		const next = infoFields[i + 1];
		const sameRole = next && getFieldRole(current.key, current.dataIndex) === getFieldRole(next.key, next.dataIndex) && getFieldRole(current.key, current.dataIndex) === 'location';
		if (sameRole) {
			blocks.push({ primary: current, secondary: next });
			i += 1;
		} else {
			blocks.push({ primary: current });
		}
	}
	return blocks;
};

const initialsOf = (value?: string) => {
	const words = (value ?? '').trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '—';
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const cardShellStyle: CSSProperties = { borderRadius: 16, overflow: 'hidden' };

function SkeletonGrid() {
	return (
		<Row gutter={[16, 16]} style={{ padding: '4px 2px 16px' }}>
			{Array.from({ length: SKELETON_COUNT }).map((_, index) => (
				// eslint-disable-next-line react/no-array-index-key
				<Col key={index} xs={24} sm={12} md={8} xl={6}>
					<Card style={cardShellStyle} styles={{ body: { padding: 20 } }}>
						<Skeleton active avatar title={{ width: '60%' }} paragraph={{ rows: 2, width: ['90%', '70%'] }} />
					</Card>
				</Col>
			))}
		</Row>
	);
}

/** Un bloque de información (ícono + etiqueta + valor + línea secundaria opcional). */
function InfoBlock({ label, icon, primary, secondary }: { label: string; icon: ReactNode; primary: ReactNode; secondary?: ReactNode }) {
	return (
		<Flex vertical gap={2} style={{ flex: '1 1 140px', minWidth: 0 }}>
			<Flex align="center" gap={5}>
				<Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>{icon} {label}</Text>
			</Flex>
			<div style={{ minWidth: 0 }}>
				<Text strong ellipsis style={{ fontSize: 13, display: 'block' }}>{primary}</Text>
				{secondary && <Text type="secondary" ellipsis style={{ fontSize: 12, display: 'block' }}>{secondary}</Text>}
			</div>
		</Flex>
	);
}

/**
 * Vista de tarjetas (gallery view) con el lenguaje visual de un listado de cobranza:
 * avatar con iniciales + punto de estado, nombre con subtítulo, píldora de estado,
 * bloques de información agrupados de a 2 (con botón de llamar en los campos de teléfono)
 * y pie con fecha + píldora opcional específica del módulo.
 */
export function CardListView<T extends IRecord>({ dataSource, fields, prefs, titleField, isLoading, renderActions, onCardClick, footerBadge, pagination, isMobile }: CardListViewProps<T>) {
	const [page, setPage] = useState(1);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const { token } = theme.useToken();
	const byKey = new Map(fields.map(field => [field.key, field]));
	const visibleFields = prefs.filter(pref => pref.visible && byKey.has(pref.key));

	if (isLoading) {
		return <SkeletonGrid />;
	}

	if (!dataSource || dataSource.length === 0) {
		return <Empty style={{ marginTop: 48 }} description="No hay datos" />;
	}

	const pageRecords = !pagination && dataSource.length > PAGE_SIZE ? dataSource.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : dataSource;

	return (
		// overflowX oculta el pequeño desborde horizontal que genera el margen negativo
		// del gutter de Row, para que nunca aparezca una barra de scroll en x.
		<Flex vertical gap={12} style={{ overflowX: 'hidden' }}>
			<Row gutter={[16, 16]} style={{ padding: '4px 2px 16px' }}>
				{pageRecords.map((record, recordIndex) => {
					const title = titleField ? String(record[titleField] ?? '') : undefined;
					const recordKey = record.id?.toString() ?? title ?? String(recordIndex);
					const isInactive = record.active === false;
					const isHovered = hoveredId === recordKey;
					const clickable = Boolean(onCardClick);
					const getValue = (field: FieldDef): unknown => (record as Record<string, unknown>)[field.dataIndex];
					const getContent = (field: FieldDef): ReactNode => {
						const value = getValue(field);
						return field.render ? field.render(value, record, 0) : (value == null ? undefined : String(value));
					};

					// Campos visibles sin el título ni "activo" (ese estado ya lo muestra el punto del avatar).
					const rest = visibleFields
						.map(pref => byKey.get(pref.key))
						.filter((field): field is FieldDef => Boolean(field) && field!.dataIndex !== String(titleField ?? '') && field!.dataIndex !== 'active');

					// Subtítulo bajo el nombre: el primer campo corto tipo identificador/texto.
					const subtitleField = rest[0];
					const tail = rest.slice(1);

					// Píldora de estado: un campo de tipo estado/método si el módulo lo tiene configurado.
					const statusField = tail.find(field => getFieldRole(field.key, field.dataIndex) === 'status');
					const blockFields = tail.filter(field => field !== statusField);

					// Fecha para el pie: se saca de los bloques para no repetirla.
					const dateField = blockFields.find(field => getFieldRole(field.key, field.dataIndex) === 'date');
					const infoFields = blockFields.filter(field => field !== dateField);

					const handleActivate = () => onCardClick?.(record);
					const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
						if (!clickable) return;
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							handleActivate();
						}
					};

					return (
						<Col key={recordKey} xs={24} sm={12} md={8} xl={6}>
							<Card
								role={clickable ? 'button' : undefined}
								tabIndex={clickable ? 0 : undefined}
								onClick={clickable ? handleActivate : undefined}
								onKeyDown={handleKeyDown}
								onMouseEnter={() => setHoveredId(recordKey)}
								onMouseLeave={() => setHoveredId(null)}
								style={{
									...cardShellStyle,
									cursor: clickable ? 'pointer' : 'default',
									opacity: isInactive ? 0.65 : 1,
									transition: 'box-shadow 200ms ease-out, transform 200ms ease-out, opacity 200ms ease-out',
									transform: isHovered && !prefersReducedMotion() ? 'translateY(-3px)' : 'none',
									boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
								}}
								styles={{ body: { display: 'flex', flexDirection: 'column', gap: 10, padding: 18 } }}
							>
								<Flex justify="space-between" align="flex-start" gap={8}>
									<Flex gap={10} align="center" style={{ minWidth: 0 }}>
										<div style={{ position: 'relative', flexShrink: 0 }}>
											<Avatar size={38} style={{ background: AVATAR_COLORS[recordIndex % AVATAR_COLORS.length], fontWeight: 600 }}>
												{initialsOf(title)}
											</Avatar>
											<span
												aria-hidden
												style={{
													position: 'absolute',
													right: -1,
													bottom: -1,
													width: 10,
													height: 10,
													borderRadius: '50%',
													background: isInactive ? token.colorTextQuaternary : token.colorPrimary,
													border: `2px solid ${token.colorBgContainer}`,
												}}
											/>
										</div>
										<div style={{ minWidth: 0 }}>
											{title && (
												<Title level={5} style={{ margin: 0, lineHeight: 1.25 }} ellipsis={{ tooltip: title }}>
													{title}
												</Title>
											)}
											{subtitleField && (
												<Text type="secondary" ellipsis style={{ fontSize: 12, display: 'block' }}>
													{getContent(subtitleField)}
												</Text>
											)}
										</div>
									</Flex>
									{renderActions && (
										<Flex gap={4} onClick={event => event.stopPropagation()} style={{ flexShrink: 0 }}>
											{renderActions(record)}
										</Flex>
									)}
								</Flex>

								{(isInactive || statusField) && (
									<Flex>
										<Tag color={isInactive ? 'default' : 'success'} style={{ borderRadius: 999, margin: 0 }}>
											{isInactive ? 'Inactivo' : getContent(statusField!)}
										</Tag>
									</Flex>
								)}

								<Divider style={{ margin: '2px 0' }} />

								{infoFields.length === 0 ? (
									<Text type="secondary" style={{ fontSize: 12 }}>
										Sin campos seleccionados — configura la tarjeta con el botón &quot;Tarjeta&quot;.
									</Text>
								) : (
									<Flex wrap gap={16}>
										{buildInfoBlocks(infoFields).map(({ primary, secondary }) => {
											const role = getFieldRole(primary.key, primary.dataIndex);

											return (
												<InfoBlock
													key={primary.key}
													label={primary.title}
													icon={ROLE_ICON[role]}
													primary={getContent(primary)}
													secondary={secondary ? getContent(secondary) : undefined}
												/>
											);
										})}
									</Flex>
								)}

								{(dateField || footerBadge) && (
									<Flex justify="space-between" align="center" style={{ marginTop: 2 }}>
										{dateField ? (
											<Text type="secondary" style={{ fontSize: 12 }}>
												<CalendarOutlined style={{ marginRight: 6 }} />
												{dateField.title}: {getContent(dateField)}
											</Text>
										) : <span />}
										{footerBadge?.(record)}
									</Flex>
								)}
							</Card>
						</Col>
					);
				})}
			</Row>

			{pagination ? (
				pagination.total > PAGE_SIZE_OPTIONS[0] && (
					<Flex justify="center">
						<Pagination
							current={pagination.page}
							pageSize={pagination.pageSize}
							total={pagination.total}
							onChange={pagination.onChange}
							showSizeChanger={!isMobile}
							pageSizeOptions={PAGE_SIZE_OPTIONS}
							simple={isMobile}
						/>
					</Flex>
				)
			) : dataSource.length > PAGE_SIZE && (
				<Flex justify="center">
					<Pagination current={page} pageSize={PAGE_SIZE} total={dataSource.length} onChange={setPage} showSizeChanger={false} />
				</Flex>
			)}
		</Flex>
	);
}

export default CardListView;
