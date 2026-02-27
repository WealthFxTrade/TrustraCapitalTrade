// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, fetchUsers } from '../../api/api';
import { AlertTriangle, Loader2, Wallet, TrendingUp, ShieldCheck, Users, Zap, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
        setIsAdmin(profile?.role === 'admin');
        setWallets(profile?.wallets || profile?.balances || []);
        setInvestments(profile?.investments || profile?.plans || []);
        
        if (profile?.role === 'admin') {
          const userList = await fetchUsers();
          setUsers(userList || []);
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load dashboard data';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Node...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-6 text-red-500" />
          <h2 className="text-xl font-black uppercase text-white mb-4 italic">System Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "User session expired."}</p>
          <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 space-y-8 font-sans">
      {/* Risk Header */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
        <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
        <p className="text-[10px] uppercase font-bold tracking-widest text-red-200/60 leading-relaxed">
          High-Risk Asset Warning: Digital asset management involves significant market volatility. Audit Protocol v8.4.1 active.
        </p>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Portfolio Overview</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-2">Investor: {user.fullName || user.email}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status: Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <Wallet className="absolute right-6 top-6 text-white/5 group-hover:text-yellow-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Total Balance</p>
          <h3 className="text-4xl font-black italic">€{user.totalBalance?.toLocaleString() || '0.00'}</h3>
        </div>
        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <TrendingUp className="absolute right-6 top-6 text-white/5 group-hover:text-green-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Active Returns</p>
          <h3 className="text-4xl font-black italic text-green-400">+{user.totalProfit?.toLocaleString() || '0.00'}</h3>
        </div>
        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <Zap className="absolute right-6 top-6 text-white/5 group-hover:text-cyan-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Active Plan</p>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-cyan-400">{user.activePlan || 'None'}</h3>
        </div>
      </div>

      {/* Admin Panel - Only visible to admins */}
      {isAdmin && (
        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-yellow-500" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Administrative Control</h2>
          </div>
          <div className="bg-white/[0.02] border border-yellow-500/20 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Investor</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">{u.fullName || u.email}</td>
                    <td className="px-6 py-4 uppercase text-[10px]">{u.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase">Verified</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-yellow-500 font-bold text-[10px] uppercase hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer Branding */}
      <div className="pt-20 pb-10 text-center border-t border-white/5">
        <p className="text-[9px] text-slate-700 uppercase font-black tracking-[0.4em]">
          Trustra Capital Trade • Audit Certified Protocol v8.4.1 • © 2016–2026
        </p>
      </div>
    </div>
  );
}

