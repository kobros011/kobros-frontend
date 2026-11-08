const fullFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** $148.650.000 */
export const formatCOP = (value: number) => `$${fullFormatter.format(Math.round(value))}`;

/** $46.5M / $320K / $950 */
export const formatCompactCOP = (value: number) => {
	const abs = Math.abs(value);
	if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
	if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`;
	return `$${Math.round(value)}`;
};

export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const getInitials = (name: string) =>
	name
		.replace(/\(.*?\)/g, '')
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? '')
		.join('');
