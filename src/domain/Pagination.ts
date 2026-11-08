export interface PaginationParams {
	page: number;
	pageSize: number;
}

export interface PageInfo<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	pages: number;
}

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
