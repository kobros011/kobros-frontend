import axios from 'axios';
import { LiquidationDto, LiquidationCreateDto } from '../dto/LiquidationDto';
import { LiquidationModel } from '@/domain/Liquidation';
import { ImplementationBase } from './base';

export class ImplementationLiquidationRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/liquidations/';

	async getList() {
		const response = await axios.get<LiquidationDto[]>(this.baseUrl);
		return { ...response, liquidations: response?.data?.map(item => LiquidationModel.ToDomain(item)) };
	}

	async getById(id: string) {
		const response = await axios.get<LiquidationDto>(this.buildUrl({ id }));
		return { ...response, liquidation: LiquidationModel.ToDomain(response.data) };
	}

	async create(data: LiquidationCreateDto) {
		const response = await axios.post<LiquidationDto>(this.baseUrl, data);
		return { ...response, liquidation: LiquidationModel.ToDomain(response.data) };
	}

	async confirm(id: string) {
		const response = await axios.post<LiquidationDto>(this.buildUrl({ id, method: 'confirm' }));
		return { ...response, liquidation: LiquidationModel.ToDomain(response.data) };
	}
}

export const repository = new ImplementationLiquidationRepository();
