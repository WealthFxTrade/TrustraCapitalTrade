import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
// Ensure this path matches your actual CSS file (common: './index.css')
import './styles/global.css';

/**
 * ErrorBoundary: Prevents the "White Screen of Death"
 * Displays the exact error in production for debugging.
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
    console.error('Critical Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-2xl shadow-2xl">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Node Render Error</h1>
            <p className="text-slate-300 mb-4 font-mono text-xs text-left overflow-auto max-h-40 bg-black/50 p-4 rounded-lg">
              {this.state.error?.stack || this.state.error?.message || 'Unknown Crash'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold"
            >
              Reboot System
            </button>
            <p className="text-slate-500 mt-4 text-[10px] uppercase tracking-widest">
              Check browser console for 2026 real-time logs
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("CRITICAL: Root element 'root' missing from index.html");
} else {
  console.log('Initializing Trustra Capital Trade v1.0.0...');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                duration: 4000,
                style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
              }} 
            />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('System render called. Validating DOM...');
}

