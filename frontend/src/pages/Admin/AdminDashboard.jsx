// src/pages/Admin/AdminDashboard.jsx - PROFESSIONAL ADMIN PANEL INTERFACE
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wallet,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import SystemHealth from './SystemHealth';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
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
      // Get users
      const usersRes = await api.get('/api/admin/users');
      const userList = usersRes.data.users || usersRes.data.data || [];
      setUsers(userList);

      // Calculate stats
      const totalUsers = userList.length;
      const totalBalance = userList.reduce((sum, user) => {
        return sum + (user.totalBalance || user.balances?.EUR || 0);
      }, 0);

      setStats({
        totalUsers,
        totalBalance: Math.round(totalBalance),
        pendingWithdrawals: 0, // Update when withdrawal route is ready
        activeNodes: 1,
      });
    } catch (err) {
      console.error('[ADMIN DASHBOARD ERROR]', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load admin dashboard');
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
              <ShieldCheck size={24} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">COMMAND CENTER</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
              System <span className="text-yellow-500">Oversight</span>
            </h1>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {loading ? 'SYNCHRONIZING...' : 'REFRESH ALL'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="TOTAL USERS" value={stats.totalUsers} icon={<Users />} color="yellow" />
          <StatCard title="TOTAL BALANCE" value={`€${stats.totalBalance.toLocaleString()}`} icon={<Wallet />} color="yellow" />
          <StatCard title="PENDING WITHDRAWALS" value={stats.pendingWithdrawals} icon={<Clock />} color="red" />
          <StatCard title="ACTIVE NODES" value={stats.activeNodes} icon={<Zap />} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Registry */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">IDENTITY REGISTRY</h3>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-full px-5 py-3 text-sm w-80 focus:border-yellow-500 outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                      <th className="pb-5">USERNAME</th>
                      <th className="pb-5">EMAIL</th>
                      <th className="pb-5 text-right">BALANCE (EUR)</th>
                      <th className="pb-5 text-center">KYC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={40} /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="py-20 text-center text-gray-500">No users found</td></tr>
                    ) : (
                      filteredUsers.slice(0, 10).map((user) => (
                        <tr key={user._id} className="hover:bg-white/5">
                          <td className="py-5 font-bold">{user.username}</td>
                          <td className="py-5 text-gray-400">{user.email}</td>
                          <td className="py-5 text-right font-mono text-yellow-400">
                            €{(user.totalBalance || user.balances?.EUR || 0).toLocaleString()}
                          </td>
                          <td className="py-5 text-center">
                            <span className={`text-xs px-4 py-1 rounded-full border ${
                              user.kycStatus === 'verified' ? 'border-emerald-500 text-emerald-400' : 'border-gray-500 text-gray-400'
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

          {/* System Health */}
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
  const colorMap = {
    yellow: 'border-yellow-500/30 text-yellow-400',
    red: 'border-red-500/30 text-red-400',
    green: 'border-emerald-500/30 text-emerald-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2.5rem] border backdrop-blur-sm ${colorMap[color]}`}
    >
      <div className="text-5xl mb-6 opacity-80">{icon}</div>
      <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">{title}</p>
      <h3 className="text-5xl font-black tracking-tighter">{value}</h3>
    </motion.div>
  );
}
