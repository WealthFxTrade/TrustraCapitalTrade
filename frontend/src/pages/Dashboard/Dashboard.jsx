import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api, { fetchUserProfile, fetchUsers } from '../../api/api';
import {
  AlertTriangle, Loader2, Wallet, TrendingUp,
  ShieldCheck, Zap, LayoutDashboard, Globe, Activity
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [btcPrice, setBtcPrice] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
        setIsAdmin(profile?.role === 'admin');

        // Fetch Global Market Price
        const priceRes = await api.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        setBtcPrice(priceRes.data.bitcoin.eur);

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
          <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Helper to extract balance from Map or Object
  const getBalance = (coin) => {
    if (!user.balances) return 0;
    return user.balances[coin] || 0; 
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 space-y-8 font-sans">
      {/* Risk Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4">
        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
        <p className="text-[10px] uppercase font-black tracking-widest text-amber-200/60 leading-relaxed">
          Automated Trading System Disclosure: Trustra nodes utilize high-precision algorithms to mitigate risk. Market volatility remains a factor. Audit Protocol v8.4.2 Active.
        </p>
      </div>

      {/* Header with Live Ticker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <LayoutDashboard className="text-yellow-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Terminal Dashboard</h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-1 italic">Authorized: {user.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <Activity className="text-emerald-500" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live BTC: €{btcPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network: Optimal</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <Wallet className="absolute right-6 top-6 text-white/5 group-hover:text-yellow-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4 italic">Liquid Balance (EUR)</p>
          <h3 className="text-4xl font-black italic">€{getBalance('EUR').toLocaleString('de-DE', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <TrendingUp className="absolute right-6 top-6 text-white/5 group-hover:text-green-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4 italic">Total ROI Yield</p>
          <h3 className="text-4xl font-black italic text-green-400">
            +€{(user.totalProfit || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <Zap className="absolute right-6 top-6 text-white/5 group-hover:text-cyan-500/10 transition-colors" size={80} />
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4 italic">Active Node</p>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-cyan-400">{user.activePlan || 'No Active Plan'}</h3>
        </div>
      </div>

      {/* Infrastructure Hubs (New for v8.4.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0f1e] p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Globe size={16} className="text-yellow-500" /> Global Operations Hubs
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { city: 'New York', hub: 'USA', color: 'bg-emerald-500' },
              { city: 'Zürich', hub: 'CH', color: 'bg-emerald-500' },
              { city: 'Gent', hub: 'BE', color: 'bg-emerald-500' }
            ].map((node, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <div className={`w-1.5 h-1.5 rounded-full ${node.color} mx-auto mb-2 animate-pulse`} />
                <p className="text-[10px] font-black uppercase">{node.city}</p>
                <p className="text-[8px] text-slate-500 font-bold">{node.hub} Node</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-tr from-yellow-500/5 to-transparent border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase text-yellow-500 mb-2">BTC Secure Address</p>
                <code className="text-[11px] font-mono text-slate-400">{user.btcAddress || 'Generating Secure Gateway...'}</code>
            </div>
            <ShieldCheck className="text-yellow-500/20" size={40} />
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-yellow-500" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Administrative Control</h2>
          </div>
          <div className="bg-white/[0.02] border border-yellow-500/20 rounded-[2.5rem] overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Investor</th>
                  <th className="px-6 py-4 text-center">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-xs">{u.fullName || u.email}</td>
                    <td className="px-6 py-4 uppercase text-[10px] text-center font-black text-cyan-400">{u.activePlan || 'Idle'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase italic">Certified</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-yellow-500 font-black text-[10px] uppercase hover:underline italic">Manage Portfolio</button>
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
          Trustra Capital Trade • Secure Audit Node v8.4.2 • © 2016–2026
        </p>
      </div>
    </div>
  );
}
