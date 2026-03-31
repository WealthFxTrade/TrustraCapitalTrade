// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Users, TrendingUp, Activity, RefreshCw,
  Loader2, Search, ArrowLeft, Ban, CheckCircle,
  LayoutDashboard, LogOut, Zap, UserCheck, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, color = "text-white" }) {
  return (
    <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-3xl group hover:border-emerald-500/30 transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center ${color} mb-6`}>
        <Icon size={22} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      <h3 className={`text-3xl font-black tracking-tighter ${color}`}>{value}</h3>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Parallel fetch for speed
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/health'), 
        api.get('/admin/users')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats || statsRes.data);
      if (usersRes.data?.success) setUsers(usersRes.data.users || []);
    } catch (err) {
      toast.error('Administrative Protocol Sync Failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 🛡️ Guard: Only allow admin roles
    if (isAuthenticated && user?.role !== 'admin' && user?.role !== 'superadmin') {
      toast.error('Access Denied: Level 4 Clearance Required');
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [fetchAdminData, isAuthenticated, user, navigate]);

  const handleTriggerYield = async () => {
    if (!window.confirm("CRITICAL: Manually trigger RIO daily yield distribution?")) return;
    const toastId = toast.loading("Executing Global Yield Protocol...");
    try {
      const { data } = await api.post('/admin/health'); 
      if (data.success) {
        toast.success("Yield successfully settled for all active nodes", { id: toastId });
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Yield distribution failed', { id: toastId });
    }
  };

  const toggleUserStatus = async (userId, isBanned, email) => {
    const action = isBanned ? 'activate' : 'ban';
    if (!window.confirm(`Confirm: ${action} node access for ${email}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      toast.success(`User protocol updated: ${email}`);
      fetchAdminData();
    } catch (err) {
      toast.error(`Status update failed`);
    }
  };

  const filteredUsers = users.filter(u =>
    u?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex font-sans overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex w-80 bg-[#0a0c10] border-r border-white/5 p-8 flex-col h-screen sticky top-0 z-50">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <ShieldAlert className="text-rose-500" size={28} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">Admin Core</h1>
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">System Level 4</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-black shadow-lg">
            <LayoutDashboard size={18} /> Overview
          </button>
          <button onClick={() => navigate('/admin/kyc')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all">
            <UserCheck size={18} /> KYC Registry
          </button>
          <div className="h-px bg-white/5 my-8" />
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 transition-all">
            <ArrowLeft size={18} /> Exit to Terminal
          </button>
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-400 transition-all border-t border-white/5 pt-8">
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </aside>

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-white/10 bg-[#020408]/80 backdrop-blur-md px-8 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tighter uppercase italic">Institutional Control Panel</h2>
          <button onClick={fetchAdminData} disabled={refreshing} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Sync System
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Users} label="Total Managed Nodes" value={stats?.totalUsers || users.length} />
            <StatCard icon={TrendingUp} label="Platform TVL" value={`€${(stats?.totalTVL || 0).toLocaleString('de-DE')}`} color="text-emerald-500" />
            <StatCard icon={Activity} label="Active Yield Cycles" value={stats?.activeNodes || 0} />
            <StatCard icon={ShieldCheck} label="Ledger Integrity" value="100%" color="text-emerald-400" />
          </div>

          {/* Action Zone: Manual Override */}
          <div className="bg-rose-600/10 border border-rose-600/20 rounded-[2.5rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tighter uppercase text-rose-500 italic">Global Yield Override</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Distribute profit settlement to all active Rio protocol nodes immediately.</p>
            </div>
            <button onClick={handleTriggerYield} className="px-10 py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 shadow-xl shadow-rose-600/20 flex items-center gap-3 transition-all active:scale-95">
              <Zap size={18} /> Execute Distribution
            </button>
          </div>

          {/* ── USER REGISTRY TABLE ── */}
          <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Global Node Registry</h3>
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH NODES BY ENTITY OR ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-10 py-6">Node / Entity</th>
                    <th className="px-10 py-6">AUM Principal</th>
                    <th className="px-10 py-6">System Status</th>
                    <th className="px-10 py-6 text-center">Protocol Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredUsers.map((u) => (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-10 py-8">
                          <p className="text-xs font-black text-white uppercase italic">{u.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">{u.email}</p>
                        </td>
                        <td className="px-10 py-8 font-black italic text-emerald-400">
                          €{(u.balances?.EUR || 0).toLocaleString('de-DE')}
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.isBanned ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                            {u.isBanned ? 'Access Restricted' : 'Operational'}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => toggleUserStatus(u._id, u.isBanned, u.email)} 
                              className={`p-3 rounded-xl transition-all ${u.isBanned ? 'bg-emerald-600 text-black hover:bg-emerald-500' : 'bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white'}`}
                              title={u.isBanned ? 'Activate User' : 'Ban User'}
                            >
                              {u.isBanned ? <CheckCircle size={16} /> : <Ban size={16} />}
                            </button>
                            <button onClick={() => navigate(`/admin/users/${u._id}`)} className="p-3 bg-white/5 rounded-xl text-white hover:bg-white/10">
                              <Activity size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-24 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">No managed nodes matching query</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

