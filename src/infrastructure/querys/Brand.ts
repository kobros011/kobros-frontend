import { queryKeyBrands, queryKeyDefault } from '@/constants/queryKeys';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { repository } from '../repositories/Brand';
import { Brand } from '@/domain/Brand';
import { TypeAction } from '@/constants/types';
import { Filters } from '@/domain/Filters';
import { PaginationParams } from '@/domain/Pagination';

export const getBrand = (brand_id?: string) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyBrands.base, queryKeyDefault.get, brand_id],
		enabled: !!brand_id,
		placeholderData: keepPreviousData,
		queryFn: () => {
			if (!brand_id) return;
			return repository.getBrand(brand_id);
		},
	});

	return {
		...queryInfo,
		brand: queryInfo.data?.data,
	};
};
export const getListBrands = (filters: Partial<Filters>, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyBrands.base, queryKeyDefault.list, filters],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => {
			return repository.getListBrands(filters);
		},
	});

	return {
		...queryInfo,
		brands: queryInfo.data?.brands,
	};
};

export const getPageBrands = (filters: Partial<Filters>, pagination: PaginationParams, isSearching: boolean) => {
	const queryInfo = useQuery({
		queryKey: [queryKeyBrands.base, queryKeyDefault.list, 'page', filters, pagination],
		enabled: isSearching,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPage(filters, pagination),
	});

	return {
		...queryInfo,
		brands: queryInfo.data?.page.items,
		total: queryInfo.data?.page.total ?? 0,
	};
};

export const createBrand = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Brand>) => {
			return repository.create(data);
		},
	});

	return mutation;
};
export const updateBrand = () => {
	const mutation = useMutation({
		mutationFn: (data: Partial<Brand>) => {
			return repository.update(data);
		},
	});

	return mutation;
};
export const deleteBrand = () => {
	const mutation = useMutation({
		mutationFn: (brand_id: string) => {
			return repository.delete(brand_id);
		},
	});

	return mutation;
};

export const useMutationType = (type: TypeAction) => {
	const jsonType = {
		create: createBrand,
		update: updateBrand,
	};

	return jsonType[type];
};