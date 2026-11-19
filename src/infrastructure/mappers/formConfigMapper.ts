import { CustomFieldDef, FormConfig } from '@/domain/Settings';
import { CustomFieldDefDto, FormConfigDto } from '@/infrastructure/dto/SettingsDto';

const customToDomain = (dto: CustomFieldDefDto): CustomFieldDef => ({
	key: dto.key,
	label: dto.label,
	type: dto.type,
	required: dto.required,
	visible: dto.visible,
	archived: dto.archived,
	options: dto.options ?? [],
	showInTable: dto.show_in_table,
	showInCard: dto.show_in_card,
	filterable: dto.filterable,
});

/** Convierte la configuración del backend (snake_case) al modelo de la app. Lo que falte usa el valor por defecto. */
export const formConfigToDomain = (dto: FormConfigDto | undefined | null): FormConfig => {
	const base: FormConfig = {
		version: dto?.version ?? 0,
		clients: {
			fields: {
				current_phone: { required: false, visible: true },
				neighborhood: { required: false, visible: true },
				linking_date: { required: true, visible: true },
			},
			sections: {
				fiador: { required: false, visible: true },
				referencia: { required: false, visible: true },
			},
			custom: [],
		},
		loans: { custom: (dto?.loans?.custom ?? []).map(customToDomain) },
		expenses: { custom: (dto?.expenses?.custom ?? []).map(customToDomain) },
		routes: { custom: (dto?.routes?.custom ?? []).map(customToDomain) },
	};
	if (!dto?.clients) return base;

	const fields = { ...base.clients.fields };
	(Object.keys(fields) as (keyof typeof fields)[]).forEach((key) => {
		const setting = dto.clients.fields?.[key];
		if (setting) fields[key] = { required: setting.required, visible: setting.visible };
	});
	const sections = { ...base.clients.sections };
	(Object.keys(sections) as (keyof typeof sections)[]).forEach((key) => {
		const setting = dto.clients.sections?.[key];
		if (setting) sections[key] = { required: setting.required, visible: setting.visible };
	});

	return {
		...base,
		version: dto.version,
		clients: { fields, sections, custom: (dto.clients.custom ?? []).map(customToDomain) },
	};
};

const customToDto = (field: CustomFieldDef): CustomFieldDefDto => ({
	key: field.key,
	label: field.label,
	type: field.type,
	required: field.required,
	visible: field.visible,
	archived: field.archived,
	options: field.options,
	show_in_table: field.showInTable,
	show_in_card: field.showInCard,
	filterable: field.filterable,
});

/** Modelo de la app a la forma que espera el backend. `version` no se envía: va aparte como `expected_version`. */
export const formConfigToDto = (config: FormConfig): Omit<FormConfigDto, 'version'> => ({
	clients: {
		fields: config.clients.fields,
		sections: config.clients.sections,
		custom: config.clients.custom.map(customToDto),
	},
	loans: { custom: config.loans.custom.map(customToDto) },
	expenses: { custom: config.expenses.custom.map(customToDto) },
	routes: { custom: config.routes.custom.map(customToDto) },
});
