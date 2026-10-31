export const formatNumber = (value: string | number | null | undefined, precision?: number): string => {
	const precisionCurrency = precision ?? 2;
	const finalValue = value || 0;

	// Eliminar cualquier carácter que no sea un número o un punto o signo negativo
	const add = parseFloat(finalValue.toString()).toFixed(2);
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
	return result;
};