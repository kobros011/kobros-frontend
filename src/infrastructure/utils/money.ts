import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { formatNumber } from './formaNumber';

const LOCALE_FORMATTERS = new Map<number, Intl.NumberFormat>();
const localeFormatter = (decimals: number) => {
	let formatter = LOCALE_FORMATTERS.get(decimals);
	if (!formatter) {
		formatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
		LOCALE_FORMATTERS.set(decimals, formatter);
	}
	return formatter;
};

export interface MoneyOptions {
	/** Agrega el código ISO al final ("$1.200.000 COP"). Por defecto sí; se apaga solo donde el título ya dice la moneda (ejes de gráficas). */
	code?: boolean
	/** `locale` = es-CO (miles con punto, como Reportes/Liquidaciones/Cobro del día) · `brand` = el formato de números de la marca (como tablas y asistente de crédito). */
	digits?: 'locale' | 'brand'
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
	const { code = true, digits = 'locale', compact = false, signed = false } = options;
	const amount = Number(value ?? 0) || 0;
	const info = currency ? useCurrencyStore.getState().catalog[currency] : undefined;
	const decimals = info?.decimals ?? 0;
	const symbol = info?.symbol ?? '';
	const sign = amount < 0 ? '\u2212' : signed && amount > 0 ? '+' : '';
	const abs = Math.abs(amount);

	let body: string;
	if (compact) {
		body = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(1)}M` : abs >= 1_000 ? `${Math.round(abs / 1_000)}K` : `${Math.round(abs)}`;
	} else if (digits === 'brand') {
		body = formatNumber(abs, decimals);
	} else {
		body = localeFormatter(decimals).format(abs);
	}

	const suffix = code && currency ? ` ${currency}` : '';
	return `${sign}${symbol}${body}${suffix}`;
};

/** `formatMoney` con la moneda de una ruta. */
export const formatRouteMoney = (value: number | string | null | undefined, routeId?: string | null, options: MoneyOptions = {}) =>
	formatMoney(value, getRouteCurrency(routeId), options);
