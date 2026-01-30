// src/components/WithdrawalForm.jsx
import { useState } from 'react';
import { useWithdraw } from '../hooks/useTransactions';

export default function WithdrawalForm() {
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const withdrawMutation = useWithdraw();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await withdrawMutation.mutateAsync({ amount: parseFloat(amount), btcAddress });
      alert('Withdrawal request submitted!');
      setAmount('');
      setBtcAddress('');
    } catch (err) {
      alert(err.message || 'Error submitting withdrawal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Request Withdrawal</h2>

      <label>
        Amount (BTC):
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border p-1 my-1 w-full"
        />
      </label>

      <label>
        BTC Address:
        <input
          type="text"
          value={btcAddress}
          onChange={(e) => setBtcAddress(e.target.value)}
          required
          className="border p-1 my-1 w-full"
        />
      </label>

      <button
        type="submit"
        disabled={withdrawMutation.isLoading}
        className="bg-blue-500 text-white p-2 rounded mt-2"
      >
        {withdrawMutation.isLoading ? 'Submitting...' : 'Withdraw'}
      </button>
    </form>
  );
}
