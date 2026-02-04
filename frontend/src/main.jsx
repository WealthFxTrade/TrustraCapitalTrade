// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/global.css'; // Adjust path if your global styles are elsewhere

/**
 * Global ErrorBoundary – catches render crashes and shows useful debug info
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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="bg-red-900/30 border border-red-700/50 p-8 rounded-2xl max-w-2xl shadow-2xl backdrop-blur-sm">
            <h1 className="text-3xl font-bold text-red-400 mb-6">Application Crash</h1>
            <div className="text-left font-mono text-sm bg-black/60 p-5 rounded-lg overflow-auto max-h-64 border border-red-800/50 mb-6">
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error?.stack || this.state.error?.message || 'Unknown error – check console'}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl font-semibold transition shadow-lg shadow-red-900/30"
            >
              Reload Application
            </button>
            <p className="mt-6 text-slate-500 text-xs uppercase tracking-widest">
              Open browser console (F12) for detailed logs • Trustra Capital Trade v1.0
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
  console.error(
    'CRITICAL: <div id="root"></div> not found in index.html – application cannot start'
  );
  document.body.innerHTML = '<h1 style="color:white;text-align:center;padding:50px;">Root element missing</h1>';
} else {
  console.log('Trustra Capital Trade – Initializing render pipeline...');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#0f172a',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#064e3b' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#7f1d1d' } },
              }}
            />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log('Render root mounted successfully');
}
