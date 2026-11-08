import { FC } from 'react';
import { Typography } from 'antd';
import { getDelinquencySummary, getPortfolioSummary } from '@/infrastructure/querys/Report';
import { formatMoney } from '@/infrastructure/utils/money';

const { Text } = Typography;

export interface CarteraTotalsFilters {
	route_id?: string
	text?: string
}

interface CarteraTotalsProps {
	label: string
	filters: CarteraTotalsFilters
	/** Monedas a mostrar: una línea por moneda, nunca se suman monedas distintas. */
	currencies: string[]
}

const TotalLine: FC<{ label: string; currency: string; total: number; count: number; showCurrency: boolean }> = ({ label, currency, total, count, showCurrency }) => (
	<Text type="secondary" style={{ display: 'block', margin: '8px 0' }}>
		{label}{showCurrency ? ` en ${currency}` : ''}: <strong>{formatMoney(total, currency)}</strong> — {count} crédito(s)
	</Text>
);

const PortfolioLine: FC<{ label: string; filters: CarteraTotalsFilters; currency: string; showCurrency: boolean }> = ({ label, filters, currency, showCurrency }) => {
	const { summary } = getPortfolioSummary({ ...filters, currency });
	return <TotalLine label={label} currency={currency} total={summary?.total_balance ?? 0} count={summary?.count ?? 0} showCurrency={showCurrency} />;
};

const DelinquencyLine: FC<{ label: string; filters: CarteraTotalsFilters; currency: string; showCurrency: boolean }> = ({ label, filters, currency, showCurrency }) => {
	const { summary } = getDelinquencySummary({ ...filters, currency });
	return <TotalLine label={label} currency={currency} total={summary?.total_balance ?? 0} count={summary?.count ?? 0} showCurrency={showCurrency} />;
};

export const PortfolioTotals: FC<CarteraTotalsProps> = ({ label, filters, currencies }) => (
	<div style={{ margin: '8px 0' }}>
		{currencies.map(currency => <PortfolioLine key={currency} label={label} filters={filters} currency={currency} showCurrency={currencies.length > 1} />)}
	</div>
);

export const DelinquencyTotals: FC<CarteraTotalsProps> = ({ label, filters, currencies }) => (
	<div style={{ margin: '8px 0' }}>
		{currencies.map(currency => <DelinquencyLine key={currency} label={label} filters={filters} currency={currency} showCurrency={currencies.length > 1} />)}
	</div>
);
