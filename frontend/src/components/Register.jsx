import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function Register({ setToken }) {
<<<<<<< HEAD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
=======
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
        body: JSON.stringify({ email, password, fullName }),
=======
        body: JSON.stringify({ fullName, email, password }),
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
<<<<<<< HEAD
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
=======
      navigate('/plan-selection'); // Redirect to plan selection after register
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-800 p-10 rounded-xl w-full max-w-md border border-indigo-600/40">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Register</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Full Name</label>
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md border border-indigo-600/40 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Create Your Account</h2>

        {error && <p className="text-red-400 mb-6 text-center">{error}</p>}

        <form onSubmit={handleRegister}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
<<<<<<< HEAD
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Email</label>
=======
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="John Doe"
              required
            />
          </div>

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
            Register
          </button>
        </form>
=======
              className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="Create a strong password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register & Continue'}
          </button>
        </form>

>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        <p className="mt-6 text-center text-gray-400">
          Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
<<<<<<< HEAD
    }
=======
}
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
