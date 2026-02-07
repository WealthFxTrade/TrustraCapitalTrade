import { useState } from 'react';

/**
 * Optimized Withdrawal Component
 * Receives live balances and update triggers from Dashboard parent
 */
function WithdrawalFunds({ balances, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    asset: 'BTC',
    amount: '',
    address: ''
  });

  const API_BASE = "https://trustracapitaltrade-backend.onrender.com";

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Instant validation using passed props
    const currentBalance = balances[formData.asset] || 0;
    if (parseFloat(formData.amount) > currentBalance) {
      setError(`Insufficient ${formData.asset} balance. Available: ${currentBalance}`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/withdrawals/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Withdrawal request failed");

      setSuccess("Your payout request has been submitted for verification.");
      setFormData({ ...formData, amount: '', address: '' });
      
      // 2. Trigger parent dashboard to refresh balances globally
      if (onUpdate) onUpdate();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#ffffff', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Payout Request</h3>
      
      <form onSubmit={handleWithdraw}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Select Asset</label>
          <select 
            value={formData.asset}
            onChange={(e) => setFormData({...formData, asset: e.target.value})}
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDT">Tether (USDT-ERC20)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Destination Wallet Address</label>
          <input 
            type="text"
            required
            placeholder={`Enter your ${formData.asset} address`}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Withdrawal Amount</label>
          <input 
            type="number"
            step="0.00000001"
            required
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>

        {error && <div style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ color: '#2ecc71', marginBottom: '15px', fontSize: '0.9rem' }}>{success}</div>}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {loading ? 'Validating Request...' : 'Confirm Withdrawal'}
        </button>
      </form>
    </div>
  );
}

export default WithdrawalFunds;

