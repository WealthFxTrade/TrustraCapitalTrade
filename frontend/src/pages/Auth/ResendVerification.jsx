// src/pages/Auth/ResendVerification.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  'https://trustracapitaltrade-backend.onrender.com';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid Node email');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setMessage(
        'Verification link sent. Check your inbox and spam folder to activate your Node.'
      );
    } catch (err) {
      setError(err.message || 'Protocol Failure. Please try again later.');
      console.error('[RESEND VERIFICATION ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] px-4 py-12">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-black text-center mb-8 text-yellow-500 italic uppercase tracking-tighter">
          Resend Node Verification
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg text-green-300 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Node Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="node@trustra.com"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-yellow-500 transition disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Sending...
              </>
            ) : (
              'Resend Verification'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Back to{' '}
          <Link to="/login" className="text-yellow-500 font-bold hover:underline">
            Node Sign-In
          </Link>
        </p>
      </div>
    </div>
  );
}
