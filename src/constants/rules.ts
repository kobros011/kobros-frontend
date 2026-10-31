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
	pattern: /^[a-zA-Z0-9._-]{4,64}$/,
	message: 'Entre 4 y 64 caracteres: letras, números, . _ -',
};