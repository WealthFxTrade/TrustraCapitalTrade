// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Wallet,
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  Clock,
  RefreshCw,
  Zap,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Search,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import api from '../../api/api';
import SystemHealth from './SystemHealth';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeNodes: 0,
  });

  // UI loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // List of users fetched from backend
  const [users, setUsers] = useState([]);

  // Search/filter term for user table
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all required dashboard data (stats + users)
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      // Handle stats response (flexible to different response shapes)
      const statsData = statsResponse.data.data || statsResponse.data || {};

      setStats({
        totalUsers: Number(statsData.totalUsers) || 0,
        totalDeposits: Number(statsData.totalDeposits) || 0,
        pendingWithdrawals: Number(statsData.pendingWithdrawals) || 0,
        activeNodes: Number(statsData.activeNodes) || 0,
      });

      // Handle users response
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.users || []);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper to extract meaningful error messages
  const getErrorMessage = (err) => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.status === 403) {
      return 'Admin access required.';
    }
    return err.message || 'Failed to load system metrics.';
  };

  // Filter users based on search term (username or email)
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 text-yellow-500">
              <ShieldCheck size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                Command Center v8.6
              </span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              System <span className="text-yellow-500">Oversight</span>
            </h1>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group ${
              loading
                ? 'text-yellow-500/50 cursor-not-allowed'
                : 'text-white/30 hover:text-yellow-500'
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw
                size={14}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
            )}
            {loading ? 'Synchronizing...' : 'Refresh Protocol'}
          </button>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Global Users"
            value={stats.totalUsers}
            icon={<Users />}
            color="yellow"
          />
          <StatCard
            title="Total Deposits"
            value={`€${stats.totalDeposits.toLocaleString()}`}
            icon={<Wallet />}
            color="yellow"
          />
          <StatCard
            title="Pending Payouts"
            value={stats.pendingWithdrawals}
            icon={<Clock />}
            color="red"
          />
          <StatCard
            title="Active Nodes"
            value={stats.activeNodes}
            icon={<Zap />}
            color="green"
          />
        </div>

        {/* SYSTEM HEALTH & USER TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* User Registry Table */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
              {/* Header with title + search */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
                  Node Registry
                </h3>

                {/* Fixed & improved search input */}
                <div className="relative flex items-center w-64">
                  <Search
                    size={14}
                    className="absolute left-3 text-white/40 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search users, email..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="
                      w-full bg-black/40 border border-white/10 rounded-full
                      pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40
                      outline-none focus:border-yellow-500/50 transition-all
                    "
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="pb-4">Identity</th>
                      <th className="pb-4">Liquidity (EUR)</th>
                      <th className="pb-4">KYC</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.slice(0, 8).map((user) => (
                      <tr
                        key={user._id}
                        className="group hover:bg-white/[0.02] transition-all"
                      >
                        <td className="py-4">
                          <p className="font-bold text-white uppercase italic">
                            {user.username}
                          </p>
                          <p className="text-[10px] text-white/30 font-mono">
                            {user.email}
                          </p>
                        </td>
                        <td className="py-4 font-mono font-bold text-yellow-500">
                          €{(user.balances?.EUR || 0).toFixed(2)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                              user.kycStatus === 'approved'
                                ? 'border-green-500/30 text-green-500'
                                : 'border-white/10 text-white/20'
                            }`}
                          >
                            {user.kycStatus?.toUpperCase() || 'NONE'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-white/20 hover:text-yellow-500 transition-colors">
                            <Edit3 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Health Component */}
          <div className="lg:col-span-1">
            <SystemHealth stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color }) {
  const colorStyles = {
    yellow: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
    red: 'text-red-500 border-red-500/20 bg-red-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2rem] border backdrop-blur-sm relative overflow-hidden group ${colorStyles[color]}`}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
        {React.cloneElement(icon, { size: 64 })}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">
        {title}
      </p>
      <h3 className="text-4xl font-black italic tracking-tighter text-white">
        {value}
      </h3>
      <div className="mt-4 flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase opacity-40">
        <TrendingUp size={12} /> Live Sync Active
      </div>
    </motion.div>
  );
}
