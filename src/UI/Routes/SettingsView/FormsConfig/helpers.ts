import type { CustomFieldDef, CustomFieldType, ClientFormConfig, FormModule } from '@/domain/Settings';

/** Claves que no puede usar un campo personalizado (campos del cliente y de la API). Mismo criterio que el backend. */
export const RESERVED_KEYS = new Set([
	'id', 'full_name', 'id_document', 'current_address', 'current_phone', 'current_mobile', 'neighborhood',
	'linking_date', 'beak', 'routes', 'routes_ids', 'brand_id', 'active', 'contacts', 'loan', 'custom_fields',
	'created_at', 'updated_at', 'text', 'route_id', 'page', 'page_size',
]);

const COMMON_RESERVED = ['id', 'custom_fields', 'active', 'created_at', 'updated_at', 'text', 'page', 'page_size', 'route_id'];

/** Claves reservadas por módulo (mismo criterio que el backend, `app/core/form_config.py`). */
export const RESERVED_BY_MODULE: Record<FormModule, Set<string>> = {
	clients: RESERVED_KEYS,
	loans: new Set([...COMMON_RESERVED, 'loan_number', 'clientroute_id', 'client_id', 'new_order', 'value_capital', 'value_quota_fixed', 'agreed_quotas', 'date_first_quota', 'payment_method', 'fixed_payment_day', 'value_payment', 'current_address', 'current_mobile']),
	expenses: new Set([...COMMON_RESERVED, 'date', 'value', 'name', 'expensesconcept_id', 'user_generated']),
	routes: new Set([...COMMON_RESERVED, 'name', 'initial_value', 'initial_expense', 'opening_date', 'loans_number', 'currency', 'allowed_users_ids', 'brand_id']),
};

/** Textos que cambian según el módulo. */
export const MODULE_COPY: Record<FormModule, { singular: string; plural: string; title: string }> = {
	clients: { singular: 'cliente', plural: 'clientes', title: 'Clientes' },
	loans: { singular: 'crédito', plural: 'créditos', title: 'Créditos' },
	expenses: { singular: 'gasto', plural: 'gastos', title: 'Gastos' },
	routes: { singular: 'ruta', plural: 'rutas', title: 'Rutas' },
};

export const MAX_CUSTOM_FIELDS = 30;
export const MAX_FILTERABLE_FIELDS = 5;
export const MAX_OPTIONS = 50;
export const MAX_LABEL_LENGTH = 60;
export const MAX_OPTION_LENGTH = 80;

export const CUSTOM_FIELD_TYPE_LABEL: Record<CustomFieldType, string> = {
	text: 'Texto',
	number: 'Número',
	money: 'Valor',
	email: 'Correo',
	phone: 'Teléfono',
	date: 'Fecha',
	select: 'Lista',
	boolean: 'Sí / No',
};

/** Quita acentos y deja solo letras minúsculas, números y guion bajo (para la clave). */
const normalizeSlug = (value: string) => value
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.toLowerCase()
	.replace(/[^a-z0-9]+/g, '_')
	.replace(/^_+|_+$/g, '');

/**
 * Clave del campo a partir de su etiqueta: "Teléfono alterno" -> "telefono_alterno".
 * Empieza por letra, no es una clave reservada y no repite ninguna de `taken`.
 */
export const buildFieldKey = (label: string, taken: string[] = [], reserved: Set<string> = RESERVED_KEYS): string => {
	let base = normalizeSlug(label).slice(0, 40).replace(/_+$/, '');
	if (!base || !/^[a-z]/.test(base)) base = `campo_${base}`.replace(/_+$/, '').slice(0, 40);
	const used = new Set(taken);
	let candidate = base;
	let counter = 2;
	while (reserved.has(candidate) || used.has(candidate)) {
		const suffix = `_${counter}`;
		candidate = `${base.slice(0, 40 - suffix.length)}${suffix}`;
		counter += 1;
	}
	return candidate;
};

/** Mensajes de validación en español para el borrador. Vacío = válido. */
export const validateCustomField = (
	draft: Pick<CustomFieldDef, 'label' | 'type' | 'options' | 'key'>,
	others: CustomFieldDef[],
	{ isNew, reserved = RESERVED_KEYS }: { isNew: boolean; reserved?: Set<string> },
): string[] => {
	const errors: string[] = [];
	const label = draft.label.trim();
	if (!label) errors.push('Escribe una etiqueta para el campo');
	if (label.length > MAX_LABEL_LENGTH) errors.push(`La etiqueta admite como máximo ${MAX_LABEL_LENGTH} caracteres`);
	if (isNew && others.some(item => item.key === draft.key)) errors.push('Ya existe un campo con esa clave en este formulario');
	if (reserved.has(draft.key)) errors.push('Ese nombre está reservado por el sistema');
	if (draft.type === 'select') {
		const options = draft.options.map(option => option.trim()).filter(Boolean);
		if (options.length === 0) errors.push('Una lista necesita al menos una opción');
		if (options.length > MAX_OPTIONS) errors.push(`Una lista admite como máximo ${MAX_OPTIONS} opciones`);
		if (options.some(option => option.length > MAX_OPTION_LENGTH)) errors.push(`Cada opción admite como máximo ${MAX_OPTION_LENGTH} caracteres`);
	}
	return errors;
};

/** Límites globales: máximo de campos personalizados y de filtrables activos. Devuelve mensaje o null. */
export const checkLimits = (custom: CustomFieldDef[], changing?: CustomFieldDef): string | null => {
	const total = changing && !custom.some(item => item.key === changing.key) ? custom.length + 1 : custom.length;
	if (total > MAX_CUSTOM_FIELDS) return `Máximo ${MAX_CUSTOM_FIELDS} campos personalizados por marca (activos y archivados)`;
	const filterable = custom.filter(item => item.filterable && !item.archived && item.visible).length;
	if (filterable > MAX_FILTERABLE_FIELDS) return `Máximo ${MAX_FILTERABLE_FIELDS} campos personalizados filtrables`;
	return null;
};

/** Mueve un elemento de `from` a `to` (índices). Devuelve una copia; no cambia el original. */
export const reorder = <T>(items: T[], from: number, to: number): T[] => {
	if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
	const next = [...items];
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
};

/** Regla de coherencia: un elemento oculto o archivado nunca queda requerido. */
export const normalizeFlags = <T extends { required: boolean; visible: boolean; archived?: boolean }>(item: T): T => (
	!item.visible || item.archived ? { ...item, required: false } : item
);

/** Compara dos configuraciones (para saber si hay cambios sin guardar). Ignora la versión. */
export const sameClientConfig = (a: ClientFormConfig, b: ClientFormConfig): boolean => JSON.stringify(a) === JSON.stringify(b);
