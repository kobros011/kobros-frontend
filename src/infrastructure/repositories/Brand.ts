import axios from 'axios';
import { ImplementationBase } from './base';
import { Brand, BrandModel } from '@/domain/Brand';
import { BrandDto } from '../dto/BrandDto';
import { Filters, FiltersModel } from '@/domain/Filters';

export class ImplementationBrandRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/brands/';

	async getBrand(id: string) {
		const response = await axios.get<BrandDto>(this.buildUrl({ id: id }));

		return {
			...response,
			data: BrandModel.ToDomain(response?.data),
		};
	}

	async getListBrands(filters: Partial<Filters>) {
		const response = await axios.get<BrandDto[]>(this.baseUrl, { params: FiltersModel.toDto(filters) });
		return {
			...response,
			brands: response?.data?.map(brand => BrandModel.ToDomain(brand)),
		};
	}

	async create(data: Partial<Brand>) {
		if (!data) return;

		return axios.post<BrandDto>(this.baseUrl, BrandModel.ToDto(data as Brand));	
	}

	async update(data: Partial<Brand>) {
		if (!data || !data.id) return;

		return axios.put<BrandDto>(this.buildUrl({ id: data.id }), BrandModel.ToDto(data as Brand));	
	}

	async delete(brand_id: string) {
		return axios.put(this.buildUrl({ id: brand_id, method: 'toggle' }));	
	}
}

export const repository = new ImplementationBrandRepository();