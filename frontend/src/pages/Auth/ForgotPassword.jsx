import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    setResetLink('');

    try {
      // API call to request password reset
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setMessage(
        'If an account exists with this email, a password reset link has been generated.'
      );
      setSubmitted(true);

      // ⚡ For dev/testing: show the link immediately
      setResetLink(`${import.meta.env.VITE_FRONTEND_URL}/reset-password/${data.token}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Reset your password
            </h2>
            <p className="mt-3 text-gray-400">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-900/40 border border-green-700 text-green-200 rounded-lg text-sm">
              {message}
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              {resetLink && (
                <p className="text-sm text-blue-400 break-all">
                  Test link: <a href={resetLink}>{resetLink}</a>
                </p>
              )}
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Return to Login
              </Link>
            </div>
          )}

          <div className="mt-8 text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
