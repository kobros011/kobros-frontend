import axios from 'axios';
import { PaginationParams } from '@/domain/Pagination';
import { mapPage, toPageQuery } from '../utils/pagination';
import {
	LiquidationCreateDto,
	LiquidationDetailDto,
	LiquidationDto,
	LiquidationListFilters,
	LiquidationPageDto,
	LiquidationPreviewDto,
	LiquidationPreviewParams,
} from '../dto/LiquidationDto';

const BASE = '/liquidations';

export const repository = {
	async preview(params: LiquidationPreviewParams) {
		return (await axios.get<LiquidationPreviewDto>(`${BASE}/preview`, { params })).data;
	},

	async getPage(filters: LiquidationListFilters, pagination: PaginationParams) {
		const response = await axios.get<LiquidationPageDto>(`${BASE}/`, { params: { ...filters, ...toPageQuery(pagination) } });
		return { ...mapPage(response.data, item => item), summary: response.data.summary };
	},

	async getDetail(id: string) {
		return (await axios.get<LiquidationDetailDto>(`${BASE}/${id}`)).data;
	},

	async create(data: LiquidationCreateDto) {
		return (await axios.post<LiquidationDto>(`${BASE}/`, data)).data;
	},

	async confirm(id: string) {
		return (await axios.post<LiquidationDto>(`${BASE}/${id}/confirm`)).data;
	},

	async reopen(id: string) {
		return (await axios.post<LiquidationDto>(`${BASE}/${id}/reopen`)).data;
	},

	async remove(id: string) {
		await axios.delete(`${BASE}/${id}`);
	},
};
