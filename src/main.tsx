import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@infrastructure/querys/queryClient';
import { ClerkProvider } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import routePaths from './constants/routePaths';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

const loginPath = `/${routePaths.BASENAME}/${routePaths.LOGIN}`;

createRoot(document.getElementById('root') as HTMLElement).render(
	<StrictMode>
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			localization={esES}
			signInUrl={loginPath}
			signUpUrl={loginPath}
			signInFallbackRedirectUrl={loginPath}
			signUpFallbackRedirectUrl={loginPath}
		>
			<QueryClientProvider client={queryClient} >
				<App />
			</QueryClientProvider>
		</ClerkProvider>
	</StrictMode>,
);
