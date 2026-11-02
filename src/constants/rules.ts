import { FormRule } from 'antd';

export const ruleRequired: FormRule = { required: true, message: 'Este campo es requerido' };

export const rulePasswordMin: FormRule = {
	min: 8,
	message: 'La contraseña debe tener al menos 8 caracteres',
};

export const ruleEmailOptional: FormRule = {
	type: 'email',
	message: 'Ingrese un correo válido',
};

export const ruleUsername: FormRule = {
	validator: (_, value) => {
		if (value === undefined || value === null || value === '') {
			return Promise.resolve();
		}
		const username = String(value);
		if (username.includes('.')) {
			return Promise.reject(
				new Error('No se puede usar punto (.); use guión bajo (_)'),
			);
		}
		if (!/^[a-zA-Z0-9_-]{4,64}$/.test(username)) {
			return Promise.reject(
				new Error('Entre 4 y 64 caracteres: letras, números, _ y -'),
			);
		}
		return Promise.resolve();
	},
};