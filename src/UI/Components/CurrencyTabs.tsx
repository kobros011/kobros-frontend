import { FC, Fragment, ReactNode } from 'react';
import { Segmented } from 'antd';
import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';
import useCurrencyStore from '@/infrastructure/context/CurrencyStore';
import { CurrencyProvider } from '@/infrastructure/hooks/useMoney';

const ALL = 'all';

interface CurrencyTabsProps {
	/** `undefined` = "Todas". */
	value?: string
	onChange: (value?: string) => void
}

/** Selector Todas · COP · USD… Solo existe si la marca tiene más de una moneda; con una sola no se muestra nada. */
export const CurrencyTabs: FC<CurrencyTabsProps> = ({ value, onChange }) => {
	const currencies = useAppSettingsStore(state => state.currencies);
	if (currencies.length < 2) return null;
	return (
		<Segmented
			size="small"
			aria-label="Moneda"
			value={value ?? ALL}
			onChange={next => onChange(next === ALL ? undefined : String(next))}
			options={[{ value: ALL, label: 'Todas' }, ...currencies.map(code => ({ value: code, label: code }))]}
		/>
	);
};

/**
 * Monedas que se deben mostrar: la de la ruta elegida, la que se eligió en el selector, o todas las de la marca (un bloque por moneda).
 * Una ruta concreta fija la moneda; nunca se mezclan monedas en un mismo bloque.
 */
export const useCurrencyScope = (selected?: string, routeId?: string): string[] => {
	const brandCurrencies = useAppSettingsStore(state => state.currencies);
	const routeCurrency = useCurrencyStore(state => (routeId ? state.routeCurrency[routeId] : undefined));
	if (routeCurrency) return [routeCurrency];
	if (selected) return [selected];
	return brandCurrencies;
};

interface CurrencyBlocksProps {
	currencies: string[]
	/** Se pinta una vez por moneda, dentro de su `CurrencyProvider`. */
	children: (currency: string) => ReactNode
}

/** Un bloque por moneda; si hay más de uno, cada bloque lleva su título ("COP", "USD") para no confundir los totales. */
export const CurrencyBlocks: FC<CurrencyBlocksProps> = ({ currencies, children }) => (
	<>
		{currencies.map(code => (
			<Fragment key={code}>
				{currencies.length > 1 && <h2 className="kb-section-title" style={{ margin: '8px 0 0' }}>Valores en {code}</h2>}
				<CurrencyProvider currency={code}>{children(code)}</CurrencyProvider>
			</Fragment>
		))}
	</>
);
