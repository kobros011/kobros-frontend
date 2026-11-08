import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { formatNumber } from './formaNumber';

export interface MoneyOptions {
	/** Agrega el código ISO al final ("$1.200.000 COP"). Por defecto sí; se apaga solo donde el título ya dice la moneda (ejes de gráficas). */
	code?: boolean
	/** $46,5M / $320K. */
	compact?: boolean
	/** Muestra "+" en los valores positivos. */
	signed?: boolean
}

/** Moneda principal de la marca (la primera configurada); sin moneda por defecto: vacío si aún no hay. */
export const getPrimaryCurrency = (): string | undefined => useAppSettingsStore.getState().currencies[0];

/** Moneda de una ruta; si no se conoce (ruta sin cargar o sin ruta) usa la principal de la marca. */
export const getRouteCurrency = (routeId?: string | null): string | undefined =>
	(routeId ? useCurrencyStore.getState().routeCurrency[routeId] : undefined) ?? getPrimaryCurrency();

/**
 * Valor con su moneda: signo antes del símbolo, monto y código ISO.
 * Sin moneda conocida muestra solo el monto (nunca asume una).
 */
export const formatMoney = (value: number | string | null | undefined, currency?: string, options: MoneyOptions = {}): string => {
	const { code = true, compact = false, signed = false } = options;
	const amount = Number(value ?? 0) || 0;
	const info = currency ? useCurrencyStore.getState().catalog[currency] : undefined;
	const decimals = info?.decimals ?? 0;
	const symbol = info?.symbol ?? '';
	const sign = amount < 0 ? '\u2212' : signed && amount > 0 ? '+' : '';
	const abs = Math.abs(amount);

	let body: string;
	if (compact) {
		body = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(1)}M` : abs >= 1_000 ? `${Math.round(abs / 1_000)}K` : `${Math.round(abs)}`;
	} else {
		// Miles y decimales con el formato que la marca eligió en Configuración.
		body = formatNumber(Number(abs.toFixed(decimals)), decimals);
	}

	const suffix = code && currency ? ` ${currency}` : '';
	return `${sign}${symbol}${body}${suffix}`;
};

/** `formatMoney` con la moneda de una ruta. */
export const formatRouteMoney = (value: number | string | null | undefined, routeId?: string | null, options: MoneyOptions = {}) =>
	formatMoney(value, getRouteCurrency(routeId), options);
