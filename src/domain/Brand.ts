import { BrandDto } from '@/infrastructure/dto/BrandDto';
import { BaseDomain } from './BaseDomain';

export interface Brand extends BaseDomain {
	name: string
	code: string
	routesAvailable: number
}

export class BrandModel {
	brand: Brand;

	constructor(brand: Brand) {
		this.brand = brand;
	}

	static ToDomain(DTO: BrandDto): Brand {	
		return {
			id: DTO.id,
			name: DTO.name,
			code: DTO.code,
			routesAvailable: DTO.routes_available,
			active: DTO.active,
			updatedAt: DTO.updated_at,
			createdAt: DTO.created_at,
		};
	}

	static ToDto(domain: Brand): Partial<BrandDto> {	
		return {
			name: domain.name,
			code: domain.code,
			routes_available: domain.routesAvailable,
			...(domain.id ? { id: domain.id } : {}),
		};
	} 
}