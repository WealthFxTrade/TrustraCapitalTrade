// src/components/Deposit.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function Deposit({ token, setUser }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return setError('Enter a valid amount');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deposit failed');

      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-indigo-400 text-center">Deposit Funds</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount in USD"
          className="w-full p-4 mb-6 bg-gray-900 border border-gray-700 rounded-lg text-white text-xl"
        />
        <button
          onClick={handleDeposit}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-xl font-bold transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  );
}
