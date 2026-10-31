import { queryKeyLiquidations, queryKeyDefault } from '@/constants/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repository } from '../repositories/Liquidation';
import { LiquidationCreateDto } from '../dto/LiquidationDto';

export const getListLiquidations = () => {
	const queryInfo = useQuery({
		queryKey: [queryKeyLiquidations.base, queryKeyDefault.list],
		queryFn: () => repository.getList(),
	});
	return { ...queryInfo, liquidations: queryInfo.data?.liquidations ?? [] };
};

export const useCreateLiquidation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: LiquidationCreateDto) => repository.create(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [queryKeyLiquidations.base] });
		},
	});
};

export const useConfirmLiquidation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => repository.confirm(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: [queryKeyLiquidations.base] });
		},
	});
};
