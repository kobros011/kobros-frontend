const fullFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** $148.650.000 */
export const formatCOP = (value: number) => `$${fullFormatter.format(Math.round(value))}`;
