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
