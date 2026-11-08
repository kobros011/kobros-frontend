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
	logo_enabled: boolean
}
