import axios from 'axios';
import { ImplementationBase } from './base';
import { LogoVariant, Settings, SettingsForm } from '@/domain/Settings';
import { SettingsDto } from '../dto/SettingsDto';

const toDomain = (dto: SettingsDto): Settings => ({
	brandId: dto.brand_id,
	brandName: dto.brand_name ?? '',
	brandCode: dto.brand_code ?? '',
	contactEmail: dto.contact_email ?? '',
	contactPhone: dto.contact_phone ?? '',
	appName: dto.app_name ?? '',
	primaryColor: dto.primary_color,
	logoFullUrl: dto.logo_full_url,
	logoFullWidth: dto.logo_full_width,
	logoFullHeight: dto.logo_full_height,
	logoFullTone: dto.logo_full_tone,
	logoMarkUrl: dto.logo_mark_url,
	logoMarkWidth: dto.logo_mark_width,
	logoMarkHeight: dto.logo_mark_height,
	logoMarkTone: dto.logo_mark_tone,
	numberFormatStyle: dto.number_format_style,
	numberDecimals: dto.number_decimals,
	logoEnabled: dto.logo_enabled,
});

export class ImplementationSettingsRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/settings/';

	async get(brandId?: string) {
		const response = await axios.get<SettingsDto>(this.baseUrl, { params: brandId ? { brand_id: brandId } : undefined });
		return toDomain(response.data);
	}

	async update(data: SettingsForm, brandId?: string) {
		const response = await axios.put<SettingsDto>(
			this.baseUrl,
			{
				brand_name: data.brandName,
				brand_code: data.brandCode,
				contact_email: data.contactEmail,
				contact_phone: data.contactPhone,
				app_name: data.appName,
				primary_color: data.primaryColor,
				number_format_style: data.numberFormatStyle,
				number_decimals: data.numberDecimals,
			},
			{ params: brandId ? { brand_id: brandId } : undefined },
		);
		return toDomain(response.data);
	}

	async uploadLogo(file: File, variant: LogoVariant, brandId?: string) {
		const body = new FormData();
		body.append('file', file);
		const response = await axios.post<SettingsDto>(`${this.baseUrl}logo`, body, {
			params: { variant, ...(brandId ? { brand_id: brandId } : {}) },
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return toDomain(response.data);
	}

	async deleteLogo(variant: LogoVariant, brandId?: string) {
		const response = await axios.delete<SettingsDto>(`${this.baseUrl}logo`, {
			params: { variant, ...(brandId ? { brand_id: brandId } : {}) },
		});
		return toDomain(response.data);
	}
}

export const repository = new ImplementationSettingsRepository();
