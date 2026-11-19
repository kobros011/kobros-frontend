export interface FieldSettingDto {
	required: boolean
	visible: boolean
}

export interface CustomFieldDefDto {
	key: string
	label: string
	type: 'text' | 'number' | 'money' | 'email' | 'phone' | 'date' | 'select' | 'boolean'
	required: boolean
	visible: boolean
	archived: boolean
	options: string[]
	show_in_table: boolean
	show_in_card: boolean
	filterable: boolean
}

export interface FormConfigDto {
	version: number
	clients: {
		fields: Record<'current_phone' | 'neighborhood' | 'linking_date', FieldSettingDto>
		sections: Record<'fiador' | 'referencia', FieldSettingDto>
		custom: CustomFieldDefDto[]
	}
	loans?: { custom: CustomFieldDefDto[] }
	expenses?: { custom: CustomFieldDefDto[] }
	routes?: { custom: CustomFieldDefDto[] }
}

export interface SettingsDto {
	brand_id: string | null
	brand_name: string | null
	brand_code: string | null
	contact_email: string | null
	contact_phone: string | null
	app_name: string | null
	primary_color: string | null
	logo_full_url: string | null
	logo_full_width: number | null
	logo_full_height: number | null
	logo_full_tone: 'dark' | 'light' | 'mixed' | null
	logo_mark_url: string | null
	logo_mark_width: number | null
	logo_mark_height: number | null
	logo_mark_tone: 'dark' | 'light' | 'mixed' | null
	number_format_style: 'comma-thousands' | 'dot-thousands'
	number_decimals: 0 | 2
	currencies: string[]
	logo_enabled: boolean
	form_config?: FormConfigDto
}
