// 1. GLOBAL POLYFILL - Prevents silent crashes from older libraries
window.process = { env: { NODE_ENV: 'development' } };
window.global = window;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/global.css';

/**
 * ErrorBoundary: Catches logic errors inside components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL RENDER ERROR:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#020617', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ padding: '20px', border: '1px solid #ef4444', borderRadius: '12px', textAlign: 'center' }}>
            <h1 style={{ color: '#ef4444' }}>System Crash Caught</h1>
            <pre style={{ fontSize: '10px', background: '#000', padding: '10px' }}>{this.state.error?.message}</pre>
            <button onClick={() => window.location.reload()} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              Restart Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  alert("CRITICAL ERROR: 'root' div not found in index.html");
} else {
  console.log('Trustra Capital: Booting system...');
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

