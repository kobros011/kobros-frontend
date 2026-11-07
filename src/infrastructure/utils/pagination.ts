import { PageInfo } from '@/domain/Pagination';
import { PageDto } from '../dto/PageDto';

/** Reutilizable por cualquier repositorio que consuma un endpoint paginado del backend (`Page[T]`). */
export const mapPage = <TDto, TDomain>(dto: PageDto<TDto>, mapper: (item: TDto) => TDomain): PageInfo<TDomain> => ({
	items: dto.items.map(mapper),
	total: dto.total,
	page: dto.page,
	pageSize: dto.page_size,
	pages: dto.pages,
});
