import { FC, ReactNode, createContext, useCallback, useContext, useMemo } from 'react';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { MoneyOptions, displaySymbol, formatMoney, getRouteCurrency } from '@/infrastructure/utils/money';

const CurrencyContext = createContext<string | undefined>(undefined);

interface CurrencyProviderProps {
	/** Moneda explícita (bloque de un reporte, selector de moneda). */
	currency?: string
	/** O la ruta de la que sale la moneda. */
	routeId?: string | null
	children: ReactNode
}

/** Todo lo que se pinte debajo formatea sus valores con esta moneda (la de una ruta o la de un bloque de reporte). */
export const CurrencyProvider: FC<CurrencyProviderProps> = ({ currency, routeId, children }) => {
	const routeCurrency = useCurrencyStore(state => (routeId ? state.routeCurrency[routeId] : undefined));
	return <CurrencyContext.Provider value={currency ?? routeCurrency}>{children}</CurrencyContext.Provider>;
};

/** Moneda del contexto; sin proveedor, la principal de la marca (nunca una fija en el código). */
export const useCurrency = (): string | undefined => {
	const fromContext = useContext(CurrencyContext);
	const primary = useAppSettingsStore(state => state.currencies[0]);
	return fromContext ?? primary;
};

/** `money(1200000)` → "$1.200.000 COP" con la moneda del contexto; `money(v, { compact: true, code: false })` para ejes y chips. */
export const useMoney = () => {
	const currency = useCurrency();
	const version = useCurrencyStore(state => state.version);
	// `version` hace que el formateador se renueve cuando llega el catálogo de monedas.
	const money = useCallback((value: number | string | null | undefined, options?: MoneyOptions) => formatMoney(value, currency, options), [currency, version]);
	return useMemo(() => Object.assign(money, { compact: (value: number | string | null | undefined) => money(value, { compact: true, code: false }) }), [money]);
};

/** Para un valor de una ruta concreta dentro de una lista que mezcla rutas (filas de historial, tarjetas de liquidación). */
export const useRouteMoney = () => {
	const version = useCurrencyStore(state => state.version);
	const primary = useAppSettingsStore(state => state.currencies[0]);
	return useCallback(
		(value: number | string | null | undefined, routeId?: string | null, options?: MoneyOptions) => formatMoney(value, getRouteCurrency(routeId) ?? primary, options),
		[version, primary],
	);
};

/** Código, símbolo y decimales de la moneda del contexto: para los campos donde se digita dinero (sin decimales en COP, con centavos en USD). */
export const useCurrencyInfo = () => {
	const currency = useCurrency();
	const info = useCurrencyStore(state => (currency ? state.catalog[currency] : undefined));
	return { code: currency, symbol: displaySymbol(info?.symbol), decimals: info?.decimals ?? 0 };
};
