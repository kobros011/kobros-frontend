import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@infrastructure/querys/queryClient';
import { ClerkProvider } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

createRoot(document.getElementById('root') as HTMLElement).render(
	<StrictMode>
		<ClerkProvider
			publishableKey={PUBLISHABLE_KEY}
			localization={esES}
			afterSignInUrl='/srv1/login'
			afterSignUpUrl='/srv1/login'
			signInUrl='/srv1/login'
			signUpUrl='/srv1/login'
		>
			<QueryClientProvider client={queryClient} >
				<App />
			</QueryClientProvider>
		</ClerkProvider>
	</StrictMode>,
);
