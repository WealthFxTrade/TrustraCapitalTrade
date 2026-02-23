import { useState } from 'react';
import { apiPost } from '../api';

export default function InvestModal({ show, onClose }) {
  const [amount, setAmount] = useState('');
  const [plan, setPlan] = useState('Rio Starter');

  if (!show) return null;

  const handleSubmit = async () => {
    const res = await apiPost('/user/invest', { amount, plan });
    alert(res.message);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Invest Now</h2>
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-2 mb-4 rounded bg-gray-900"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="w-full p-2 mb-4 rounded bg-gray-900"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option>Rio Starter</option>
          <option>Rio Basic</option>
          <option>Rio Standard</option>
          <option>Rio Advanced</option>
          <option>Rio Elite</option>
        </select>
        <button onClick={handleSubmit} className="w-full bg-indigo-600 py-2 rounded font-bold">Invest</button>
        <button onClick={onClose} className="w-full mt-2 bg-gray-700 py-2 rounded">Cancel</button>
      </div>
    </div>
  );
            }
