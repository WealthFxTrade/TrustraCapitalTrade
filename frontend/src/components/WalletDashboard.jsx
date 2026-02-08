// src/components/WalletDashboard.jsx
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DepositTab from './DepositTab.jsx';
import WithdrawalTab from './WithdrawalTab.jsx';
import RecentActivity from './RecentActivity.jsx';
import { getBalances } from '../api/wallet.js';
import { getRecentTransactions } from '../api/transaction.js';
import { getProfile } from '../api/user.js';

const SOCKET_URL = process.env.REACT_APP_API_URL;

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [balances, setBalances] = useState({ BTC: 0, ETH: 0, USDT: 0, EUR: 0 });
  const [transactions, setTransactions] = useState([]);
  const [userRole, setUserRole] = useState('user'); // default
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch user role and initial data
    const fetchData = async () => {
      try {
        const user = await getProfile();
        setUserRole(user.role || 'user');

        const balanceData = await getBalances();
        setBalances(balanceData.balances || balances);

        const txData = await getRecentTransactions();
        setTransactions(txData);
      } catch (err) {
        console.error('Initial fetch error:', err);
      } finally {
        setLoadingBalances(false);
        setLoadingTransactions(false);
      }
    };
    fetchData();

    // WebSocket for real-time updates
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on('balanceUpdate', setBalances);
    socket.on('transactionUpdate', (tx) => setTransactions(prev => [tx, ...prev]));
    socket.on('connect', () => console.log('🟢 WebSocket connected'));
    socket.on('disconnect', () => console.log('🔴 WebSocket disconnected'));

    return () => socket.disconnect();
  }, []);

  const tabStyle = (tabName) => ({
    padding: '12px 24px',
    margin: '0 5px',
    background: activeTab === tabName ? '#4CAF50' : '#f0f0f0',
    color: activeTab === tabName ? '#fff' : '#333',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: '600',
    flex: 1
  });

  const formatBalance = (ticker) => {
    const value = balances[ticker] || 0;
    return ticker === 'EUR' || ticker === 'USDT' ? value.toFixed(2) : value.toFixed(6);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '25px' }}>Financial Overview</h2>

      {/* Admin-only button */}
      {userRole === 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            Admin Panel
          </button>
        </div>
      )}

      {/* Balances */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '30px' }}>
        {['EUR', 'BTC', 'ETH', 'USDT'].map(ticker => (
          <div key={ticker} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>{ticker} Balance</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
              {loadingBalances ? '...' : formatBalance(ticker)}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('deposit')} style={tabStyle('deposit')}>Deposit Assets</button>
        <button onClick={() => setActiveTab('withdraw')} style={tabStyle('withdraw')}>Withdraw Funds</button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="dashboard-content" style={{ minHeight: '400px' }}>
        {activeTab === 'deposit' ? <DepositTab /> : <WithdrawalTab />}
      </div>

      {/* Recent Activity */}
      <RecentActivity transactions={transactions} loading={loadingTransactions} />

      {/* Footer */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#999' }}>Secure Blockchain Gateway v4.2.0 | © 2026 Trustra Capital</p>
      </div>
    </div>
  );
}
