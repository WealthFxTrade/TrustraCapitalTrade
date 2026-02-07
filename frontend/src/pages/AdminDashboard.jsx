import React, { useEffect, useState } from 'react';
import { 
  Users, Wallet, ShieldCheck, CheckCircle, 
  RefreshCw, TrendingUp, Mail, UserCheck, AlertCircle 
} from 'lucide-react';
import { adminStats, adminKyc, adminApproveKyc } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, kycRes] = await Promise.all([adminStats(), adminKyc()]);
        setStats(statsRes.data);
        setKyc(kycRes.data);
      } catch (err) {
        console.error("Admin Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleApproveKyc = async (id) => {
    if (!window.confirm("Verify this investor for 2026 Compliance?")) return;
    try {
      await adminApproveKyc(id);
      setKyc(prev => prev.filter(k => k._id !== id));
    } catch (err) {
      alert("KYC Approval Failed");
    }
  };

  if (loading || !stats) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white pt-32 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">Trustra Admin Panel</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Global Operations Center • February 2026 Audit
          </p>
        </div>

        {/* STATS GRID (EUR Standard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
            <Users className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Investors</span>
            </div>
            <h3 className="text-4xl font-mono font-black">{stats.users.toLocaleString()}</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group text-green-400">
            <Wallet className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-green-500">
              <TrendingUp size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Deposits (EUR)</span>
            </div>
            <h3 className="text-4xl font-mono font-black">€{stats.deposits.toLocaleString('de-DE')}</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-yellow-500">
              <UserCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending KYC</span>
            </div>
            <h3 className="text-4xl font-mono font-black">{kyc.length}</h3>
          </div>
        </div>

        {/* KYC APPROVAL QUEUE */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500" /> Compliance Queue
            </h2>
          </div>

          <div className="overflow-x-auto">
            {kyc.length === 0 ? (
              <div className="py-24 text-center">
                <CheckCircle size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">All investor verifications cleared</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/[0.01] text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="px-10 py-6">Investor Email</th>
                    <th className="px-10 py-6 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kyc.map((k) => (
                    <tr key={k._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                          <Mail size={18} />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-slate-300">{k.user.email}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button
                          onClick={() => handleApproveKyc(k._id)}
                          className="bg-green-600 hover:bg-green-500 text-white font-black py-3 px-8 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-600/20 transition-all active:scale-95"
                        >
                          Approve Investor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="mt-12 flex items-center justify-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest italic">Trustra Nodes: Online</span>
          </div>
          <div className="flex items-center gap-2">
             <AlertCircle size={12} />
             <span className="text-[9px] font-black uppercase tracking-widest italic">Compliance: 2026 Standard</span>
          </div>
        </div>

      </div>
    </div>
  );
}

