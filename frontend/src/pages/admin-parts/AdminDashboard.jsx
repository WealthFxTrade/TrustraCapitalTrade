import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, XCircle, ArrowUpRight,
  Menu, X, LogOut, Loader2, Wallet, Activity, History
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

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Stats and 2. Pending withdrawals using template literals correctly
      const [statsRes, wdRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/api/withdrawals/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!statsRes.ok || !wdRes.ok) throw new Error('Failed to synchronize with Trustra Nodes');

      const statsData = await statsRes.json();
      const wdData = await wdRes.json();

      setStats(statsData.data || statsData.stats || stats);
      setPendingWithdrawals(wdData.data || wdData.withdrawals || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, [token, navigate, fetchAdminData]);

  const handleUpdateWithdrawal = async (id, status, note = '') => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNote: note }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');

      setPendingWithdrawals((prev) => prev.filter((w) => w._id !== id));
      alert(`Withdrawal ${status} successfully`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f121d] border-r border-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight">Trustra Admin</span>
        </div>

        <nav className="p-4 space-y-1">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-800 transition text-xs font-bold uppercase tracking-widest">
            <Users size={18} /> Users
          </Link>
          <Link to="/admin/withdrawals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-800 transition text-xs font-bold uppercase tracking-widest">
            <DollarSign size={18} /> Withdrawals
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition mt-10 text-xs font-bold uppercase tracking-widest">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="bg-[#0f121d]/80 backdrop-blur border-b border-gray-800 p-4 sticky top-0 z-40 flex items-center justify-between">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <h2 className="font-black uppercase tracking-tighter text-gray-400">Control Center</h2>
          <div className="bg-indigo-600/20 px-4 py-1 rounded-full border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            Production Mode
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox label="Total Users" val={stats.totalUsers} icon={<Users className="text-blue-500" />} />
            <StatBox label="Pending Payouts" val={stats.pendingWithdrawals} icon={<Activity className="text-red-500" />} />
            <StatBox label="Pending Deposits" val={stats.pendingDeposits} icon={<Wallet className="text-yellow-500" />} />
            <StatBox label="Total Profit Paid" val={`€${stats.totalProfitPaid}`} icon={<CheckCircle className="text-green-500" />} />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* WITHDRAWALS TABLE */}
            <div className="bg-[#0f121d] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/20">
                <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-red-500" /> Pending Withdrawals
                </h3>
                <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-3 py-1 rounded-full">{pendingWithdrawals.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#05070a] text-gray-500 font-black uppercase">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {pendingWithdrawals.map(w => (
                      <tr key={w._id} className="hover:bg-white/5">
                        <td className="p-4 font-bold">{w.user?.fullName || 'User'}</td>
                        <td className="p-4 text-red-400 font-black italic">€{w.amount}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleUpdateWithdrawal(w._id, 'approved')} className="bg-green-600 p-2 rounded-lg hover:bg-green-500 transition"><CheckCircle size={14}/></button>
                          <button onClick={() => handleUpdateWithdrawal(w._id, 'rejected', 'Policy violation')} className="bg-red-600 p-2 rounded-lg hover:bg-red-500 transition"><XCircle size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DEPOSITS TABLE COMPONENT */}
            <div className="bg-[#0f121d] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-gray-800 bg-black/20 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                 <History size={16} className="text-indigo-500" /> Manual Deposits
               </div>
               <DepositApprovalTable token={token} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatBox({ label, val, icon }) {
  return (
    <div className="bg-[#0f121d] border border-gray-800 p-6 rounded-3xl flex items-center justify-between hover:border-indigo-500/50 transition">
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">{label}</p>
        <p className="text-2xl font-black mt-1">{val}</p>
      </div>
      <div className="p-3 bg-black/40 rounded-2xl">{icon}</div>
    </div>
  );
}

