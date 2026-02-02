// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/global.css';

// Simple ErrorBoundary to catch render errors and show them instead of blank
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught error in boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#111', color: '#ff6b6b', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ff6b6b' }}>Render Error – App Crashed</h1>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {this.state.error?.stack || 'No stack trace available'}
          </pre>
          <p style={{ marginTop: '1rem' }}>
            Check browser console for more details. Likely issue in AuthProvider, App, or a hook.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: 'root' element not found in index.html");
} else {
  console.log('Starting React render...'); // Debug log

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('Render called – check if content flashes or error boundary shows');
}
