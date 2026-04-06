import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Render app with or without Clerk based on key availability
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
