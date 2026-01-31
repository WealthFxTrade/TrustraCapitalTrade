// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, XCircle, ArrowUpRight,
  Menu, X, LogOut, Loader2
} from 'lucide-react';
import DepositApprovalTable from '../../components/admin/DepositApprovalTable';

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
        setLoading(true);
        setError(null);

        // 1. Stats
        const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statsRes.ok) {
          const errData = await statsRes.json();
          throw new Error(errData.message || `HTTP ${statsRes.status}`);
        }

        const statsData = await statsRes.json();
        setStats(statsData.data || stats); // assuming your backend returns { success: true, data: {...} }

        // 2. Pending withdrawals
        const wdRes = await fetch(`${BACKEND_URL}/api/withdrawals/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!wdRes.ok) {
          const errData = await wdRes.json();
          throw new Error(errData.message || `HTTP ${wdRes.status}`);
        }

        const wdData = await wdRes.json();
        setPendingWithdrawals(wdData.data || wdData.withdrawals || []);

      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, [token, navigate]); // ← fixed dependency array

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this withdrawal request? This action cannot be undone.')) return;

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

      setPendingWithdrawals((prev) => prev.filter((w) => w._id !== id));
      alert('Withdrawal approved successfully');
    } catch (err) {
      alert(`Error approving withdrawal: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Enter reason for rejection (optional):')?.trim();
    if (note === null) return; // cancelled

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/withdrawals/ \){id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'rejected',
          adminNote: note || 'No reason provided',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');

      setPendingWithdrawals((prev) => prev.filter((w) => w._id !== id));
      alert('Withdrawal rejected');
    } catch (err) {
      alert(`Error rejecting withdrawal: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xl text-indigo-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Error</h2>
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={logout}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition"
          >
            Logout & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-400">Admin Panel</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-900/50 text-white"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="h-5 w-5" />
            Users
          </Link>
          <Link
            to="/admin/withdrawals"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <DollarSign className="h-5 w-5" />
            Withdrawals
          </Link>
          <Link
            to="/admin/deposits"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowUpRight className="h-5 w-5" />
            Deposits
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/30 transition-colors text-left mt-10 text-red-400"
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
          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-300">Total Users</h3>
                <Users className="h-6 w-6 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
              <p className="text-sm text-gray-400 mt-1">
                {stats.verifiedUsers || 0} verified
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-300">Pending Deposits</h3>
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold">{stats.pendingDeposits || 0}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-300">Pending Withdrawals</h3>
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold">{stats.pendingWithdrawals || 0}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-gray-300">Total Profit Paid</h3>
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">
                ${Number(stats.totalProfitPaid || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Pending Withdrawals Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Pending Withdrawals</h3>
              <span className="text-sm text-gray-400">
                {pendingWithdrawals.length} pending
              </span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <p className="p-8 text-center text-gray-400">No pending withdrawals at this time</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
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
                      <tr
                        key={w._id}
                        className="border-b border-gray-800 hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-4">
                          {w.user?.fullName || w.user?.email || 'Unknown'}
                        </td>
                        <td className="p-4 font-medium text-green-400">
                          ${Number(w.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm font-mono text-gray-400 break-all">
                          {w.btcAddress
                            ? `\( {w.btcAddress.slice(0, 8)}... \){w.btcAddress.slice(-6)}`
                            : 'N/A'}
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {new Date(w.createdAt).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(w._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1.5 transition"
                            aria-label="Approve withdrawal"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(w._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1.5 transition"
                            aria-label="Reject withdrawal"
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

          {/* Deposit Approval Table */}
          <div className="mt-8">
            <DepositApprovalTable token={token} />
          </div>
        </main>
      </div>
    </div>
  );
}
