import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

const plans = [
  { name: 'Rio Starter', min: 100, max: 999, return: '6% – 9%' },
  { name: 'Rio Basic', min: 1000, max: 4999, return: '9% – 12%' },
  { name: 'Rio Standard', min: 5000, max: 14999, return: '12% – 16%' },
  { name: 'Rio Advanced', min: 15000, max: 49999, return: '16% – 20%' },
  { name: 'Rio Elite', min: 50000, max: Infinity, return: '20% – 25%' },
];

export default function PlanSelection({ token, setUser }) {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectPlan = async () => {
    if (!selectedPlan || !amount) return setError('Select a plan and enter amount');

    const plan = plans.find(p => p.name === selectedPlan);
    if (amount < plan.min) return setError(`Minimum for ${plan.name} is $${plan.min}`);

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/select-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan, amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Plan selection failed');

      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-indigo-400">Choose Your Investment Plan</h1>

        {error && <p className="text-red-400 text-center mb-8">{error}</p>}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gray-800 rounded-2xl p-8 border-2 transition-all cursor-pointer ${
                selectedPlan === plan.name ? 'border-indigo-500 shadow-2xl' : 'border-gray-700 hover:border-indigo-600'
              }`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">{plan.name}</h3>
              <div className="text-3xl font-bold mb-2">${plan.min.toLocaleString()} – {plan.max === Infinity ? '+' : plan.max.toLocaleString()}</div>
              <div className="text-xl text-green-400 mb-6">{plan.return} monthly</div>
              <ul className="text-gray-300 space-y-3 mb-6">
                <li>✓ Daily accrual</li>
                <li>✓ Instant deposit</li>
                <li>✓ Professional support</li>
              </ul>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="bg-gray-800 rounded-2xl p-8 max-w-xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center text-indigo-400">Investment Amount</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD"
              className="w-full p-4 mb-6 bg-gray-900 border border-gray-700 rounded-lg text-white text-xl focus:outline-none focus:border-indigo-500"
              min={plans.find(p => p.name === selectedPlan)?.min}
            />
            <button
              onClick={handleSelectPlan}
              disabled={loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm & Invest'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
