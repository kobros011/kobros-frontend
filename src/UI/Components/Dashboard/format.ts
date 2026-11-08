export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const getInitials = (name: string) =>
	name
		.replace(/\(.*?\)/g, '')
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? '')
		.join('');
