import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

// App & Styles
import App from './App';
import './index.css'; // Your Tailwind/Global styles
import 'nprogress/nprogress.css'; // REQUIRED for the global loading bar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          {/* Toaster: Global component that listens to toast.success/error 
              Positioned top-center for the 'Fintech' feel.
          */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a', // Slate-900
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderRadius: '1rem',
              },
            }}
          />
          <App />
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
