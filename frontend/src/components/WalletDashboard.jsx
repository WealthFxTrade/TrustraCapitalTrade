import { useState, useEffect } from 'react';
import DepositFunds from './DepositFunds.jsx';
import WithdrawalFunds from './WithdrawalFunds.jsx';

/**
 * Trustra Capital Trade - Wallet Dashboard 2026
 * Handles global state for user balances and asset selection.
 */
function WalletDashboard() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [balances, setBalances] = useState({ BTC: 0, ETH: 0, USDT: 0 });
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://trustracapitaltrade-backend.onrender.com";

  // Global balance fetcher to update both tabs simultaneously
  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/user/balances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setBalances(data.balances || { BTC: 0, ETH: 0, USDT: 0 });
      }
    } catch (err) {
      console.error("Dashboard Balance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // Poll balances every 30 seconds for live ROI updates
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabStyle = (tabName) => ({
    padding: '12px 24px',
    margin: '0 5px',
    background: activeTab === tabName ? '#4CAF50' : '#f0f0f0',
    color: activeTab === tabName ? '#ffffff' : '#333333',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    flex: 1
  });

  return (
    <div style={{ 
      maxWidth: '700px', 
      margin: '40px auto', 
      padding: '25px', 
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '25px' }}>
        Financial Overview
      </h2>

      {/* Real-time Balance Display */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '10px', 
        marginBottom: '30px' 
      }}>
        {['BTC', 'ETH', 'USDT'].map((ticker) => (
          <div key={ticker} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>{ticker} Balance</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
              {loading ? '...' : (balances[ticker] || 0).toFixed(ticker === 'USDT' ? 2 : 6)}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('deposit')} style={tabStyle('deposit')}>
          Deposit Assets
        </button>
        <button onClick={() => setActiveTab('withdraw')} style={tabStyle('withdraw')}>
          Withdraw Funds
        </button>
      </div>

      {/* Dynamic Component Rendering */}
      <div className="dashboard-content" style={{ minHeight: '400px' }}>
        {activeTab === 'deposit' ? (
          <DepositFunds onUpdate={fetchBalances} />
        ) : (
          <WithdrawalFunds balances={balances} onUpdate={fetchBalances} />
        )}
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>
          Secure Blockchain Gateway v4.2.0 | © 2026 Trustra Capital
        </p>
      </div>
    </div>
  );
}

export default WalletDashboard;

