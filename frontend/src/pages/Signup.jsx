import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({ fullName, email, password });
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 p-3 rounded bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 border border-slate-600"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 border border-slate-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 border border-slate-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition ${
            loading ? 'bg-cyan-600/50 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-black'
          }`}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
