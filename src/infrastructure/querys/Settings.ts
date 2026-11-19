import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryKeySettings } from '@/constants/queryKeys';
import { FormConfig, LogoVariant, SettingsForm } from '@/domain/Settings';
import { repository } from '../repositories/Settings';
import useUserStore from '../context/User/UserDataStore';

// La URL del logo está firmada (SAS, 1 h): se refresca antes de que expire.
const STALE_MS = 30 * 60 * 1000;

export const getSettings = (brandId?: string, enabled = true) => {
	const userId = useUserStore(state => state.user.id);
	const queryInfo = useQuery({
		queryKey: [queryKeySettings.base, userId, brandId ?? 'own'],
		enabled,
		staleTime: STALE_MS,
		refetchInterval: STALE_MS,
		placeholderData: keepPreviousData,
		queryFn: () => repository.get(brandId),
	});

	return { ...queryInfo, settings: queryInfo.data };
};

export const updateSettings = (brandId?: string) => useMutation({
	mutationFn: (data: SettingsForm) => repository.update(data, brandId),
});

/** Guarda la configuración de formularios; al terminar, la consulta de ajustes se refresca (ver FormsConfig). */
export const updateFormConfig = (brandId?: string) => useMutation({
	mutationFn: ({ config, expectedVersion }: { config: FormConfig; expectedVersion: number }) => repository.updateFormConfig(config, expectedVersion, brandId),
});

export const uploadLogo = (brandId?: string) => useMutation({
	mutationFn: ({ file, variant }: { file: File; variant: LogoVariant }) => repository.uploadLogo(file, variant, brandId),
});

export const deleteLogo = (brandId?: string) => useMutation({
	mutationFn: (variant: LogoVariant) => repository.deleteLogo(variant, brandId),
});
