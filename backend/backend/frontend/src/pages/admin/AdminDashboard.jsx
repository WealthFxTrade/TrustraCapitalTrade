// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle, XCircle, ArrowUpRight,
  Menu, X, LogOut, Loader2 
} from 'lucide-react';
import DepositApprovalTable from '../../components/admin/DepositApprovalTable'; // ← corrected import path

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function AdminDashboard({ token, logout }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalProfitPaid: 0,
  });

  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Stats
        const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error('Failed to load stats');
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);

        // Pending withdrawals
        const wdRes = await fetch(`${BACKEND_URL}/api/withdrawals/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!wdRes.ok) throw new Error('Failed to load withdrawals');
        const wdData = await wdRes.json();
        setPendingWithdrawals(wdData.withdrawals || []);

      } catch (err) {
        setError(err.message);
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  // Approve withdrawal
  const handleApprove = async (id) => {
    if (!window.confirm('Approve this withdrawal?')) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/withdrawals/ \){id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');

      setPendingWithdrawals(prev => prev.filter(w => w._id !== id));
      alert('Withdrawal approved successfully');
    } catch (err) {
      alert('Error approving: ' + err.message);
    }
  };

  // Reject withdrawal
  const handleReject = async (id) => {
    const note = window.prompt('Reason for rejection (optional):');
    if (note === null) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/withdrawals/ \){id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: 'rejected', 
          adminNote: note.trim() || 'No reason provided' 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');

      setPendingWithdrawals(prev => prev.filter(w => w._id !== id));
      alert('Withdrawal rejected');
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-white animate-pulse flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center text-red-400 max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={logout}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
          >
            Logout & Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-400">Admin Panel</h1>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-900/50 text-white">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link to="/admin/withdrawals" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <DollarSign className="h-5 w-5" />
            Withdrawals
          </Link>
          <Link to="/admin/deposits" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <ArrowUpRight className="h-5 w-5" />
            Deposits
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/30 transition text-left mt-8 text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <h2 className="text-xl font-semibold">Admin Dashboard</h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden md:block">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-300">Total Users</h3>
                <Users className="h-6 w-6 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
              <p className="text-sm text-gray-400 mt-1">{stats.verifiedUsers || 0} verified</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-300">Pending Deposits</h3>
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold mt-2">{stats.pendingDeposits || 0}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-300">Pending Withdrawals</h3>
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold mt-2">{stats.pendingWithdrawals || 0}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-300">Total Profit Paid</h3>
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold mt-2">
                ${stats.totalProfitPaid?.toLocaleString() || '0.00'}
              </p>
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6 md:mb-8">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Pending Withdrawals</h3>
              <span className="text-sm text-gray-400">{pendingWithdrawals.length} pending</span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <p className="p-8 text-center text-gray-400">No pending withdrawals</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-sm text-gray-400">
                      <th className="p-4">User</th>
                      <th className="p-4">Amount (USD)</th>
                      <th className="p-4">BTC Address</th>
                      <th className="p-4">Requested</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((w) => (
                      <tr key={w._id} className="border-b border-gray-800 hover:bg-gray-700/50">
                        <td className="p-4">{w.user?.fullName || w.user?.email || 'Unknown'}</td>
                        <td className="p-4 font-medium text-green-400">${w.amount.toLocaleString()}</td>
                        <td className="p-4 text-sm font-mono text-gray-400">
                          {w.btcAddress ? `${w.btcAddress.slice(0, 8)}...` : 'N/A'}
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(w._id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1 transition"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(w._id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1 transition"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Deposit Approval Table – placed at the bottom as requested */}
          <div className="mt-8">
            <DepositApprovalTable token={token} />
          </div>
        </main>
      </div>
    </div>
  );
}
