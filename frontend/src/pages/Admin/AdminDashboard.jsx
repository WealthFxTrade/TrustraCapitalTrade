// src/pages/Admin/AdminDashboard.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wallet,
  Clock,
  Zap,
  RefreshCw,
  Loader2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/api';
import SystemHealth from './SystemHealth';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeNodes: 1,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch users (we already have this route)
      const usersRes = await api.get('/api/admin/users');
      
      // Fetch health for system stats
      const healthRes = await api.get('/api/admin/health');

      let userList = [];
      if (usersRes.data?.success) {
        userList = usersRes.data.users || usersRes.data.data || [];
        setUsers(userList);
      }

      // Calculate basic stats from users
      const totalUsers = userList.length;
      const totalDeposits = userList.reduce((sum, user) => {
        return sum + (user.totalBalance || user.balances?.EUR || 0);
      }, 0);

      const pendingWithdrawals = 0; // You can extend this later when withdrawal endpoint is ready

      setStats({
        totalUsers,
        totalDeposits: Math.round(totalDeposits),
        pendingWithdrawals,
        activeNodes: 1,
      });

    } catch (err) {
      console.error('[ADMIN DASHBOARD ERROR]', err);
      const msg = err.response?.data?.message || 'Failed to load admin dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 text-yellow-500">
              <ShieldCheck size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                COMMAND CENTER v8.6
              </span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              System <span className="text-yellow-500">Oversight</span>
            </h1>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {loading ? 'SYNCHRONIZING...' : 'REFRESH PROTOCOL'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="GLOBAL USERS"
            value={stats.totalUsers}
            icon={<Users />}
            color="yellow"
          />
          <StatCard
            title="TOTAL DEPOSITS"
            value={`€${stats.totalDeposits.toLocaleString()}`}
            icon={<Wallet />}
            color="yellow"
          />
          <StatCard
            title="PENDING PAYOUTS"
            value={stats.pendingWithdrawals}
            icon={<Clock />}
            color="red"
          />
          <StatCard
            title="ACTIVE NODES"
            value={stats.activeNodes}
            icon={<Zap />}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Registry */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
                  IDENTITY REGISTRY
                </h3>

                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm focus:border-yellow-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                      <th className="pb-5 text-left">USERNAME</th>
                      <th className="pb-5 text-left">EMAIL</th>
                      <th className="pb-5 text-right">BALANCE (EUR)</th>
                      <th className="pb-5 text-center">KYC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-yellow-500" size={40} />
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center text-rose-400">
                          <AlertTriangle size={48} className="mx-auto mb-4" />
                          {error}
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.slice(0, 10).map((user) => (
                        <tr key={user._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-5 font-bold">{user.username}</td>
                          <td className="py-5 text-gray-400 text-sm">{user.email}</td>
                          <td className="py-5 text-right font-mono text-yellow-400">
                            €{(user.totalBalance || user.balances?.EUR || 0).toLocaleString()}
                          </td>
                          <td className="py-5 text-center">
                            <span className={`text-xs px-4 py-1 rounded-full border ${
                              user.kycStatus === 'verified' 
                                ? 'border-emerald-500 text-emerald-400' 
                                : 'border-white/20 text-gray-500'
                            }`}>
                              {user.kycStatus?.toUpperCase() || 'UNSUBMITTED'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Health Sidebar */}
          <div className="lg:col-span-1">
            <SystemHealth />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card
function StatCard({ title, value, icon, color }) {
  const colors = {
    yellow: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5',
    red: 'border-red-500/30 text-red-400 bg-red-500/5',
    green: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2.5rem] border backdrop-blur-sm ${colors[color]}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{title}</p>
      <h3 className="text-5xl font-black tracking-tighter">{value}</h3>
      <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-50">
        <TrendingUp size={14} /> LIVE
      </div>
    </motion.div>
  );
}
