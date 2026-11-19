import type { CustomFieldDef } from '@/domain/Settings';
import { formatMoney, getPrimaryCurrency } from '@/infrastructure/utils/money';

const DMY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const isBlank = (value: unknown) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/** Fecha en formato ISO (AAAA-MM-DD) desde lo que devuelve el selector (DD/MM/AAAA o un objeto con `format`). */
const toIsoDate = (value: unknown): unknown => {
	if (typeof value === 'string') {
		const match = DMY.exec(value.trim());
		return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
	}
	if (value && typeof value === 'object' && 'format' in value && typeof (value as { format: unknown }).format === 'function') {
		return (value as { format: (pattern: string) => string }).format('YYYY-MM-DD');
	}
	return value;
};

/**
 * Valores de los campos personalizados que se envían al guardar. Solo los campos activos (no archivados ni ocultos):
 * los archivados se conservan en el servidor. Un campo vacío se envía como `null`, que borra su valor.
 */
export const customFieldsPayload = (values: Record<string, unknown> | undefined, active: CustomFieldDef[]): Record<string, unknown> =>
	Object.fromEntries(active.map((field) => {
		const raw = values?.[field.key];
		if (isBlank(raw)) return [field.key, null];
		if (field.type === 'date') return [field.key, toIsoDate(raw)];
		return [field.key, typeof raw === 'string' ? raw.trim() : raw];
	}));

/** Texto de solo lectura de un valor personalizado (campos archivados en edición). */
export const displayCustomValue = (value: unknown, field?: Pick<CustomFieldDef, 'type'>): string => {
	if (value === undefined || value === null || value === '') return '—';
	if (typeof value === 'boolean') return value ? 'Sí' : 'No';
	// Valor monetario: con el formato de números y la moneda principal de la marca.
	if (field?.type === 'money' && (typeof value === 'number' || typeof value === 'string')) return formatMoney(value, getPrimaryCurrency());
	return String(value);
};

/**
 * Filtros de campos personalizados para la consulta: solo los filtrables con valor, en texto plano (booleanos "true"/"false",
 * fechas AAAA-MM-DD). Texto con menos del mínimo se omite (el formulario ya lo avisa).
 */
export const customFiltersPayload = (values: Record<string, unknown> | undefined, filterable: CustomFieldDef[]): Record<string, string> => {
	const out: Record<string, string> = {};
	filterable.forEach((field) => {
		const raw = values?.[field.key];
		if (isBlank(raw)) return;
		const value = field.type === 'date' ? toIsoDate(raw) : raw;
		const text = typeof value === 'string' ? value.trim() : String(value);
		if (field.type === 'text' && text.length < 3) return;
		out[field.key] = text;
	});
	return out;
};
