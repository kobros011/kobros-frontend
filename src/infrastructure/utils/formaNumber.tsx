import useAppSettingsStore from '@/infrastructure/context/AppSettingsStore';

export const parseFormNumber = (value: string | number | null | undefined): number => {
	if (value === null || value === undefined || value === '') return 0;
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	const normalized = value.toString().replace(/,/g, '').trim();
	if (normalized === '' || normalized === '-') return 0;
	const parsed = parseFloat(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
};

export const formatNumber = (value: string | number | null | undefined, precision?: number): string => {
	const { numberFormatStyle, numberDecimals } = useAppSettingsStore.getState();
	const precisionCurrency = precision ?? numberDecimals;
	const finalValue = value || 0;

	const add = parseFormNumber(finalValue).toFixed(2);
	const number = add.toString().replace(/[^\d.-]/g, '');

	// Dividir el valor en parte entera y parte decimal
	const parts = number.split('.');
	let intPart = parts[0]; // números antes del primer punto encontrado
	let decimalPart = parts[1] || ''; // números despues del primer punto encontrado

	// Limitar la parte decimal a 8 decimales
	decimalPart = decimalPart.slice(0, 8);
	// Agregar comas como separadores de miles
	intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	
	const result = precisionCurrency > 0 ? intPart + (decimalPart ? `.${decimalPart.slice(0, precisionCurrency)}` : '') : intPart;
	if (numberFormatStyle === 'dot-thousands') {
		return result.replace(/[,.]/g, char => (char === ',' ? '.' : ','));
	}
	return result;
};