import { LoginJwt } from '@domain/Login';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
	jwt: LoginJwt,
	userId: string,
	expiredDate?: dayjs.Dayjs,
	refreshExpiredDate?: dayjs.Dayjs,
	setJwt: (jwt: LoginJwt) => void,
	isExpiredAccessToken: () => boolean,
	isExpiredRefreshToken: () => boolean,
	resetStore: () => void
}

const initialState: Pick<State, 'jwt' | 'expiredDate' | 'refreshExpiredDate' | 'userId' > = {
	jwt: {
		accessToken: '',
		refreshToken: '',
		tokenType: '',
	},
	expiredDate: undefined,
	refreshExpiredDate: undefined,
	userId: '',
};

const useUserJWTStore = create<State>()(persist(
	(set, get) => ({
		...initialState,
		setJwt(jwt) {
			const tokenData = jwtDecode(jwt.accessToken);
			const refreshTokenData = jwtDecode(jwt.refreshToken);
			const userId = tokenData?.sub ?? '';
			const expiredDate = tokenData?.exp ? dayjs.unix(tokenData.exp) : undefined;
			const refreshExpiredDate = refreshTokenData?.exp ? dayjs.unix(refreshTokenData.exp) : undefined;

			set({ jwt, userId, expiredDate, refreshExpiredDate });
		},
		isExpiredAccessToken: () => {
			if (!get().expiredDate) return true;

			const expiredDate = dayjs(get().expiredDate);
            
			return expiredDate.isBefore(dayjs());
		},
		isExpiredRefreshToken: () => {
			if (!get().refreshExpiredDate) return true;
			const refreshExpiredDate = dayjs(get().refreshExpiredDate);

			return refreshExpiredDate.isBefore(dayjs());
		},
		resetStore() {
			set({ ...initialState });
		},
	}), {
		name: 'user-jwt',
	},
));
export default useUserJWTStore;
