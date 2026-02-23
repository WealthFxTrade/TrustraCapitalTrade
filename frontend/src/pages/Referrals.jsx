import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Users, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  TrendingUp, 
  Award, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Referrals() {
  const { stats, user } = useUser();
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/register?ref=${user?.username || user?._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral Link Cached");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <Users size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Network Expansion</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">
          Affiliate <span className="text-indigo-500">/</span> Terminal
        </h2>
      </header>

      {/* 1. Referral Link Console */}
      <div className="glass-card p-8 border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-500/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Unique Invitation Endpoint</h4>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Expand the Trustra network. For every node leased via your link, you receive <span className="text-indigo-400">10% commission</span>.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <div className="flex-1 md:w-80 bg-black/40 border border-slate-800 rounded-xl px-4 py-3 font-mono text-[11px] text-indigo-400 truncate flex items-center">
              {referralLink}
            </div>
            <button 
              onClick={handleCopy}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} 
              {copied ? "Link Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Network Size', value: stats?.referralCount || 0, icon: <Users />, color: 'text-blue-500' },
          { label: 'Protocol Earnings', value: `€${(stats?.referralEarnings || 0).toLocaleString()}`, icon: <Award />, color: 'text-emerald-500' },
          { label: 'Conversion Rate', value: '12.5%', icon: <TrendingUp />, color: 'text-indigo-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 border-slate-800 group hover:border-indigo-500/30 transition-all">
            <div className={`p-3 bg-slate-950 rounded-xl w-fit mb-4 border border-slate-800 group-hover:scale-110 transition-transform ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-white font-mono">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* 3. Team Roster (Downlines) */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-white/5 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" /> Linked Nodes
          </h3>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Downlines</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4">Investor</th>
                <th className="px-6 py-4">Node Tier</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(stats?.referrals || []).length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    No linked nodes detected in the current buffer.
                  </td>
                </tr>
              ) : (
                stats.referrals.map((ref, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-500 font-bold text-[10px]">
                        {ref.fullName[0]}
                      </div>
                      <span className="text-xs font-bold text-white">{ref.fullName}</span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">
                      {ref.activePlan || 'Standard'}
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-bold font-mono">
                      +€{(ref.commissionAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

