// src/components/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Success
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Login</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              placeholder="you@example.com"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/forgot-password" className="text-indigo-400 hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
