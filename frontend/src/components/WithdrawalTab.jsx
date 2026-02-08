// src/components/WithdrawalTab.jsx
import { useState } from 'react';
import { requestWithdrawal } from '../api/withdrawal.js';

export default function WithdrawalTab({ balances, onSuccess }) {
  const [withdrawalData, setWithdrawalData] = useState({ asset: 'EUR', amount: '', address: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { asset, amount, address } = withdrawalData;
    if (!amount || !address) {
      setMessage('Amount and wallet address are required.');
      return;
    }

    if (parseFloat(amount) > (balances[asset] || 0)) {
      setMessage(`Insufficient ${asset} balance.`);
      return;
    }

    try {
      setLoading(true);
      await requestWithdrawal(asset, parseFloat(amount), address);
      setMessage('Withdrawal requested successfully.');
      setWithdrawalData({ asset: 'EUR', amount: '', address: '' });
      onSuccess(); // refresh balances
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error requesting withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <select
        value={withdrawalData.asset}
        onChange={e => setWithdrawalData({ ...withdrawalData, asset: e.target.value })}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      >
        {Object.keys(balances).map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <input
        type="number"
        value={withdrawalData.amount}
        onChange={e => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
        placeholder="Amount"
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />

      <input
        type="text"
        value={withdrawalData.address}
        onChange={e => setWithdrawalData({ ...withdrawalData, address: e.target.value })}
        placeholder="Wallet Address"
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Submitting...' : 'Submit Withdrawal'}
      </button>

      {message && <p style={{ color: message.includes('successfully') ? '#2c3e50' : '#e74c3c' }}>{message}</p>}
    </form>
  );
}
