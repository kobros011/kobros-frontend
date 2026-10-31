import { BaseDto } from './BaseDto';

export interface BrandDto extends BaseDto {
	name: string
	code: string
	routes_available: number
}