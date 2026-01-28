// src/components/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

const plans = [
  { value: 'Rio Starter', label: 'Rio Starter ($100–$999, 6–9% monthly)' },
  { value: 'Rio Basic', label: 'Rio Basic ($1,000–$4,999, 9–12% monthly)' },
  { value: 'Rio Standard', label: 'Rio Standard ($5,000–$14,999, 12–16% monthly)' },
  { value: 'Rio Advanced', label: 'Rio Advanced ($15,000–$49,999, 16–20% monthly)' },
  { value: 'Rio Elite', label: 'Rio Elite ($50,000+, 20–25% monthly)' },
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedPlan = location.state?.selectedPlan || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(preSelectedPlan);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) return setError('Full name is required');
    if (!email.includes('@') || !email.includes('.')) return setError('Invalid email');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (!selectedPlan) return setError('Please select an investment plan');

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Success
      localStorage.setItem('token', data.token);
      navigate('/plan-selection'); // or '/dashboard' if you prefer
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-400">Create Your Account</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
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
            />
          </div>

          {/* Password */}
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
              placeholder="Create a strong password"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Plan Selection (pre-filled if coming from landing) */}
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-300 mb-2">
              Choose Your Investment Plan
            </label>
            <select
              id="plan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition"
              required
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: <span className="text-indigo-400 font-medium">{selectedPlan}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
