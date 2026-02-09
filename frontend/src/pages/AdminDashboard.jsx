import React, { useEffect, useState } from 'react';
import {
  Users,
  Wallet,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Mail,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { adminStats, adminKyc, adminApproveKyc } from '../api';
import toast from 'react-hot-toast';

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
        toast.error("Failed to synchronize with Global Node");
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
      toast.success("Investor Verified Successfully");
    } catch (err) {
      toast.error("KYC Approval Failed");
    }
  };

  if (loading || !stats) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white pt-32 pb-20 px-8 selection:bg-blue-500/30">
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
          {/* Total Investors */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
            <Users className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Investors</span>
            </div>
            <h3 className="text-4xl font-mono font-black">
              {stats.users?.toLocaleString() || 0}
            </h3>
          </div>

          {/* Total Deposits */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group text-green-400">
            <Wallet className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-green-500">
              <TrendingUp size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Deposits (EUR)</span>
            </div>
            <h3 className="text-4xl font-mono font-black">
              €{stats.deposits?.toLocaleString('de-DE') || 0}
            </h3>
          </div>

          {/* Pending KYC */}
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
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                  All investor verifications cleared
                </p>
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
                  {kyc.map((item) => (
                    <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{item.email}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                              ID: {item._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button
                          onClick={() => handleApproveKyc(item._id)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                          Verify Investor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FOOTER METRICS */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 group hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Node Sync</p>
              <p className="text-[10px] font-mono text-emerald-500">ACTIVE • 0.04ms</p>
            </div>
            <div className="text-center md:text-left border-l border-white/10 pl-8">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Audit Status</p>
              <p className="text-[10px] font-mono text-blue-500">COMPLIANT (Q1-2026)</p>
            </div>
          </div>
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
            Trustra Capital Trade • Administration Core v4.0.1
          </p>
        </div>
      </div>
    </div>
  );
}

