import axios from 'axios';
import { CollectionTodayDto } from '../dto/CollectionDto';
import { CollectionModel } from '@/domain/Collection';
import { ImplementationBase } from './base';

export class ImplementationCollectionRepository extends ImplementationBase {
	protected readonly baseUrl: string = '/payments/';

	async getListCollection(routeId: string, date?: string) {
		const params: Record<string, string> = { route_id: routeId };
		if (date) params.date = date;
		const response = await axios.get<CollectionTodayDto[]>(`${this.baseUrl}today`, { params });
		return {
			...response,
			collection: response?.data?.map(item => CollectionModel.ToDomain(item)),
		};
	}
}

export const repository = new ImplementationCollectionRepository();
