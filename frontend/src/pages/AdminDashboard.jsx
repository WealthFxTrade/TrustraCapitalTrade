import React, { useEffect, useState } from 'react';
import { 
  Users, Wallet, ShieldCheck, CheckCircle, 
  RefreshCw, TrendingUp, UserCheck, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api'; // Standardized central API instance
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Parallel Data Fetching
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, kycRes] = await Promise.all([
        api.get('/admin/stats'), 
        api.get('/admin/kyc/pending')
      ]);
      setStats(statsRes.data);
      setKyc(kycRes.data.users || kycRes.data);
    } catch (err) {
      console.error("Admin Sync Error:", err);
      toast.error("Failed to synchronize with Global Node");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. KYC Approval Logic
  const handleApproveKyc = async (id) => {
    if (!window.confirm("Verify this investor for 2026 Compliance?")) return;
    try {
      await api.patch(`/admin/kyc/approve/${id}`);
      setKyc(prev => prev.filter(k => k._id !== id));
      toast.success("Investor Verified Successfully");
      fetchAdminData(); // Refresh stats
    } catch (err) {
      toast.error("KYC Approval Failed");
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Accessing Admin Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Trustra Admin Panel</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Global Operations Center • February 2026 Audit
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <Users className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform" size={100} />
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Investors</span>
            </div>
            <h3 className="text-4xl font-mono font-black">{stats.users?.toLocaleString() || 0}</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -top-4 opacity-5 text-green-500" size={100} />
            <div className="flex items-center gap-3 mb-4 text-green-500">
              <Wallet size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Liquidity (EUR)</span>
            </div>
            <h3 className="text-4xl font-mono font-black text-green-400">€{stats.deposits?.toLocaleString('de-DE') || 0}</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <UserCheck className="absolute -right-4 -top-4 opacity-5 text-yellow-500" size={100} />
            <div className="flex items-center gap-3 mb-4 text-yellow-500">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending KYC</span>
            </div>
            <h3 className="text-4xl font-mono font-black">{kyc.length}</h3>
          </div>
        </div>

        {/* KYC QUEUE TABLE */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500" /> Compliance Queue
            </h2>
          </div>

          <div className="overflow-x-auto">
            {kyc.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-slate-800" />
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">All Nodes Compliant</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/[0.03] border-b border-white/5 text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">
                  <tr>
                    <th className="p-6">Investor Identity</th>
                    <th className="p-6">Document Node</th>
                    <th className="p-6 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kyc.map((investor) => (
                    <tr key={investor._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <span className="font-black text-indigo-400">{investor.fullName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{investor.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono italic">{investor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {investor.kycType || 'National ID / Passport'}
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => handleApproveKyc(investor._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-lg shadow-emerald-600/20 ml-auto flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Approve Node
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-12 flex justify-between items-center opacity-30 border-t border-white/5 pt-8">
           <p className="text-[9px] font-black uppercase tracking-[0.3em]">Vault Guard Active • SSL AES-256</p>
           <p className="text-[9px] font-black uppercase tracking-[0.3em]">Trustra Capital Trade Inc. • 2026</p>
        </footer>
      </div>
    </div>
  );
}

