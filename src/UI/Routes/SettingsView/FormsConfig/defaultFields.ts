import type { CustomFieldDef, CustomFieldType } from '@/domain/Settings';

export type DefaultFieldCategory = 'texto' | 'contacto' | 'seleccion';

export interface DefaultFieldPreset {
	/** Clave que sale de la etiqueta (la misma que genera el modal al crear); sirve para saber si ya está agregado. */
	key: string
	label: string
	type: CustomFieldType
	category: DefaultFieldCategory
	description: string
	options?: string[]
	/** Nota corta bajo la tarjeta (límite o comportamiento). */
	hint?: string
}

export const DEFAULT_FIELD_CATEGORY_LABEL: Record<DefaultFieldCategory, string> = {
	texto: 'Texto',
	contacto: 'Contacto',
	seleccion: 'Selección',
};

/** Biblioteca de campos por defecto que una marca puede agregar con un clic (tipos y textos del mockup). */
export const DEFAULT_FIELD_LIBRARY: DefaultFieldPreset[] = [
	{ key: 'correo', label: 'Correo', type: 'email', category: 'contacto', description: 'Para enviar avisos y comprobantes' },
	{ key: 'telefono_alterno', label: 'Teléfono alterno', type: 'phone', category: 'contacto', description: 'Contacto de respaldo en caso de no ubicar al cliente' },
	{ key: 'fecha_de_nacimiento', label: 'Fecha de nacimiento', type: 'date', category: 'texto', description: 'Para cálculo de edad y políticas de riesgo', hint: 'Validación automática' },
	{ key: 'ocupacion', label: 'Ocupación', type: 'text', category: 'texto', description: 'Actividad económica principal del solicitante' },
	{ key: 'empresa', label: 'Empresa', type: 'text', category: 'texto', description: 'Lugar de trabajo actual o negocio independiente', hint: 'Máx. 80 caracteres' },
	{ key: 'observaciones', label: 'Observaciones', type: 'text', category: 'texto', description: 'Comentarios operativos adicionales', hint: 'Formato multilínea' },
	{ key: 'estado_civil', label: 'Estado civil', type: 'select', category: 'seleccion', description: 'Situación civil del cliente', options: ['Soltero/a', 'Casado/a', 'Unión libre', 'Viudo/a'], hint: 'Lista (4 opciones)' },
	{ key: 'tiene_vehiculo', label: 'Tiene vehículo', type: 'boolean', category: 'seleccion', description: 'Si el cliente tiene vehículo propio' },
];

/** Datos iniciales del modal para un campo de la biblioteca (el usuario puede ajustarlos antes de crear). */
export const presetToDraft = (preset: DefaultFieldPreset): Partial<CustomFieldDef> => ({
	label: preset.label,
	type: preset.type,
	options: preset.options ?? [],
});
