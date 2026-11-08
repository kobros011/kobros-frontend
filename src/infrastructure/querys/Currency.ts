import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useCurrencyStore, { CurrencyInfo } from '../context/CurrencyStore';

const CATALOG_STALE_MS = 60 * 60 * 1000;

/** Catálogo ISO de monedas (se usa en Configuración para elegir las de la marca). */
export const getCurrencyCatalog = (enabled = true) => {
	const queryInfo = useQuery({
		queryKey: ['currencies', 'catalog'],
		enabled,
		staleTime: CATALOG_STALE_MS,
		queryFn: async () => (await axios.get<CurrencyInfo[]>('/settings/currencies')).data,
	});
	return { ...queryInfo, catalog: queryInfo.data ?? [] };
};

/** Moneda de cada ruta (activas e inactivas), para mostrar cada valor con la moneda de su ruta. */
export const getRouteCurrencies = (enabled = true) => {
	const queryInfo = useQuery({
		queryKey: ['currencies', 'routes'],
		enabled,
		staleTime: 5 * 60 * 1000,
		queryFn: async () => (await axios.get<{ id: string, currency: string }[]>('/routes/currencies')).data,
	});
	return { ...queryInfo, routeCurrencies: queryInfo.data };
};

/** Mantiene `CurrencyStore` al día para que `formatMoney` (fuera de componentes) conozca el catálogo y la moneda de cada ruta. */
export const useCurrencyBootstrap = (enabled: boolean) => {
	const { catalog } = getCurrencyCatalog(enabled);
	const { routeCurrencies } = getRouteCurrencies(enabled);
	const setCatalog = useCurrencyStore(state => state.setCatalog);
	const setRouteCurrencies = useCurrencyStore(state => state.setRouteCurrencies);
	useEffect(() => { if (catalog.length) setCatalog(catalog); }, [catalog]);
	useEffect(() => { if (routeCurrencies) setRouteCurrencies(routeCurrencies); }, [routeCurrencies]);
};
