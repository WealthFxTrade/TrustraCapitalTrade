import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/api.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // token from email link

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!token) {
      return toast.error('Invalid or missing reset token');
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });

      toast.success('Password reset successful! You can now log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-[#0a0d14] p-8 rounded-2xl shadow-xl border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
              Reset Password
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Enter your new password below to update your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                placeholder="New Password"
                className="w-full pl-4 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full pl-4 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all ${
                isLoading
                  ? 'bg-blue-600/50 text-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-700/30 text-white'
              }`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="text-blue-400 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
