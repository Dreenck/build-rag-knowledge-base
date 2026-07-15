import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "missing_key"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#171717',
          colorInputBackground: '#262626',
          colorInputText: '#f5f5f5',
          colorText: '#f5f5f5',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'border border-neutral-800 shadow-xl',
          formButtonPrimary: 'shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors',
          footerActionLink: 'text-blue-500 hover:text-blue-400',
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
