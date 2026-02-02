import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: 'root' element not found in index.html");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* Ensure AuthProvider does not have an infinite loop in its useEffect */}
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  );
}

