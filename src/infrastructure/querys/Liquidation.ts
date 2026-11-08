import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeyCollection, queryKeyLiquidations, queryKeyPayments } from '@/constants/queryKeys';
import { PaginationParams } from '@/domain/Pagination';
import { repository } from '../repositories/Liquidation';
import { LiquidationCreateDto, LiquidationListFilters, LiquidationPreviewParams } from '../dto/LiquidationDto';

const KEY = queryKeyLiquidations.base;

export const getLiquidationPreview = (params: Partial<LiquidationPreviewParams>) => {
	const queryInfo = useQuery({
		queryKey: [KEY, 'preview', params],
		enabled: !!params.route_id && !!params.date,
		placeholderData: keepPreviousData,
		queryFn: () => repository.preview(params as LiquidationPreviewParams),
	});
	return { ...queryInfo, preview: queryInfo.data };
};

export const getLiquidationPage = (filters: LiquidationListFilters, pagination: PaginationParams, enabled = true) => {
	const queryInfo = useQuery({
		queryKey: [KEY, 'list', filters, pagination],
		enabled,
		placeholderData: keepPreviousData,
		queryFn: () => repository.getPage(filters, pagination),
	});
	return { ...queryInfo, page: queryInfo.data };
};

export const getLiquidationDetail = (id?: string) => {
	const queryInfo = useQuery({
		queryKey: [KEY, 'detail', id],
		enabled: !!id,
		queryFn: () => repository.getDetail(id as string),
	});
	return { ...queryInfo, detail: queryInfo.data };
};

/** Cerrar, confirmar, reabrir o eliminar mueve el listado, la vista previa y lo que Cobro del día muestra como liquidado. */
const useInvalidateAfter = () => {
	const queryClient = useQueryClient();
	return () => {
		for (const key of [KEY, queryKeyCollection.base, queryKeyPayments.base]) {
			void queryClient.invalidateQueries({ queryKey: [key] });
		}
	};
};

export const useCreateLiquidation = () => {
	const invalidate = useInvalidateAfter();
	return useMutation({ mutationFn: (data: LiquidationCreateDto) => repository.create(data), onSuccess: invalidate });
};

export const useConfirmLiquidation = () => {
	const invalidate = useInvalidateAfter();
	return useMutation({ mutationFn: (id: string) => repository.confirm(id), onSuccess: invalidate });
};

export const useReopenLiquidation = () => {
	const invalidate = useInvalidateAfter();
	return useMutation({ mutationFn: (id: string) => repository.reopen(id), onSuccess: invalidate });
};

export const useDeleteLiquidation = () => {
	const invalidate = useInvalidateAfter();
	return useMutation({ mutationFn: (id: string) => repository.remove(id), onSuccess: invalidate });
};
