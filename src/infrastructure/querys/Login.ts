import { useMutation } from '@tanstack/react-query';
import { LoginData } from '../dto/LoginDto';
import { repository } from '../repositories/Login';

export const login = () => {
	const mutation = useMutation({
		mutationFn: (data: LoginData) => {
			return repository.login(data);
		},
	});

	return mutation;
};

export const refreshToken = () => {
	const mutation = useMutation({
		mutationFn: (token: string) => {
			return repository.refreshToken(token);
		},
	});

	return mutation;
};