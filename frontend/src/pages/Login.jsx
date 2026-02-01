import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await loginUser({ email, password });

      // Assuming backend returns { user, token }
      login(data.user, data.token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-cyan-400 text-center mb-12">
          Trustra Capital
        </h1>

        <div className="bg-slate-800/70 rounded-2xl p-10 border border-slate-700 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                loading ? 'bg-cyan-600/50 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-black'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400">
            <p className="mt-4">
              Don't have an account?{' '}
              <a href="/signup" className="text-cyan-400 hover:text-cyan-300">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} Trustra Capital Trade • Operating since 2016
        </p>
      </div>
    </div>
  );
}
