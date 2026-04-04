// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Deposit from './Deposit.jsx';
import Withdrawal from './Withdrawal.jsx';
import Invest from './Invest.jsx';
import Ledger from './Ledger.jsx';
import Profile from './Profile.jsx';
import api, { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('Invest');
  const [balances, setBalances] = useState({ EUR: 0, INVESTED: 0, ROI: 0 });
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  // ------------------- Fetch User Balances -------------------
  const fetchBalances = async () => {
    setLoadingBalances(true);
    try {
      const res = await api.get(API_ENDPOINTS.USER.STATS);
      if (res.data.success) {
        setBalances(res.data.data.balances || { EUR: 0, INVESTED: 0, ROI: 0 });
        setTransactions(res.data.data.transactions || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch balances');
    } finally {
      setLoadingBalances(false);
    }
  };

  // ------------------- Fetch Admin Stats -------------------
  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return;
    try {
      const [statsRes, kycRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.HEALTH),
        api.get(`${API_ENDPOINTS.ADMIN.USERS}?kyc=pending`),
      ]);
      if (statsRes.data.success) setAdminStats(statsRes.data.data || {});
      if (kycRes.data.success) setPendingKYCs(kycRes.data.users || []);
    } catch (err) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalances();
      fetchAdminData();
    }
  }, [user]);

  // ------------------- Tab Content -------------------
  const renderTab = () => {
    switch (activeTab) {
      case 'Invest':
        return <Invest balances={balances} refreshBalances={fetchBalances} />;
      case 'Ledger':
        return <Ledger transactions={transactions} />;
      case 'Deposit':
        return <Deposit refreshBalances={fetchBalances} />;
      case 'Withdraw':
        return <Withdrawal balances={balances} refreshBalances={fetchBalances} />;
      case 'Profile':
        return <Profile refreshSession={refreshSession} />;
      case 'AdminStats':
        return user?.role === 'admin' ? (
          <div className="grid gap-4">
            <div className="p-4 bg-white/10 rounded-xl">
              <p>Total Users: {adminStats.totalUsers || 0}</p>
              <p>Total AUM: €{adminStats.totalAUM?.toLocaleString() || 0}</p>
              <p>Pending Withdrawals: €{adminStats.pendingWithdrawals?.toLocaleString() || 0}</p>
              <p>Platform Health: {adminStats.health || 'Unknown'}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl">
              <h2 className="font-bold mb-2">Pending KYC Requests</h2>
              {pendingKYCs.length === 0 ? (
                <p>No pending requests</p>
              ) : (
                <ul className="list-disc pl-6">
                  {pendingKYCs.map((k) => (
                    <li key={k._id}>
                      {k.name} ({k.email}) - {k.kycStatus}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-500">Unauthorized</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div>
          <span className="text-gray-400 mr-4">Hello, {user?.fullName || user?.name}</span>
          <button
            onClick={refreshSession}
            className="px-4 py-2 bg-emerald-500 rounded-xl hover:bg-emerald-600 font-bold text-sm"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-4 mb-6 flex-wrap">
        {['Invest', 'Ledger', 'Deposit', 'Withdraw', 'Profile']
          .concat(user?.role === 'admin' ? ['AdminStats'] : [])
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                activeTab === tab ? 'bg-emerald-500 text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
      </nav>

      {/* Balances Summary */}
      <div className="flex gap-4 mb-6 text-sm flex-wrap">
        <div className="flex-1 p-4 bg-white/10 rounded-xl text-center">
          <p className="text-gray-400">Available EUR</p>
          <p className="text-white font-bold text-lg">€{balances.EUR.toLocaleString()}</p>
        </div>
        <div className="flex-1 p-4 bg-white/10 rounded-xl text-center">
          <p className="text-gray-400">Invested</p>
          <p className="text-white font-bold text-lg">€{balances.INVESTED.toLocaleString()}</p>
        </div>
        <div className="flex-1 p-4 bg-white/10 rounded-xl text-center">
          <p className="text-gray-400">ROI</p>
          <p className="text-white font-bold text-lg">€{balances.ROI.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="">{renderTab()}</div>
    </div>
  );
}
