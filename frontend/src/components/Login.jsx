import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
<<<<<<< HEAD
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
=======
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
<<<<<<< HEAD

=======
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
<<<<<<< HEAD
=======
    } finally {
      setLoading(false);
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-800 p-10 rounded-xl w-full max-w-md border border-indigo-600/40">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Login</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Email</label>
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-indigo-600/40 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Login</h2>

        {error && <p className="text-red-400 mb-6 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Email</label>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-gray-300 mb-2">Password</label>
=======
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account? <a href="/register" className="text-indigo-400 hover:underline">Register</a>
=======
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-indigo-400 hover:underline font-medium">Register</a>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        </p>
      </div>
    </div>
  );
}
