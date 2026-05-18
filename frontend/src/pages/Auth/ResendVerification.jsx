// src/pages/Auth/ResendVerification.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';

import api, { API_ENDPOINTS } from '@/api/api';

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

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email: cleanEmail }
      );

      setMessage(
        data?.message ||
          'Verification link sent. Please check your inbox and spam folder.'
      );
    } catch (err) {
      console.error('[RESEND VERIFICATION ERROR]', err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Request failed. Try again later.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] px-4 py-12">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">

        <h2 className="text-3xl font-black text-center mb-8 text-yellow-500 uppercase tracking-tight">
          Resend Verification
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-green-900/40 border border-green-600 text-green-300 rounded-lg text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-600 text-red-300 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:border-yellow-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
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
          <Link
            to="/login"
            className="text-yellow-500 font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
