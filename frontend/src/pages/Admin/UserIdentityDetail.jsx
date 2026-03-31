import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  Wallet, 
  MapPin, 
  Mail, 
  Calendar,
  ArrowLeft,
  UserCog,
  Ban,
  Fingerprint
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function UserIdentityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const { data } = await api.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
        setUser(data.user);
      } catch (err) {
        toast.error("Node Retrieval Failed: Invalid Entity ID");
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id, navigate]);

  if (loading) return <div className="py-40 text-center animate-pulse font-black uppercase tracking-[0.5em] text-gray-800">Interrogating Database...</div>;

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      {/* ── BREADCRUMB / ACTIONS ── */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
            Restrict Node (Ban)
          </button>
          <button className="px-6 py-3 bg-emerald-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all">
            Force Balance Sync
          </button>
        </div>
      </div>

      {/* ── PROFILE HEADER ── */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-12 flex flex-col xl:flex-row gap-12 items-center">
        <div className="relative">
          <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black italic shadow-2xl">
            {user.name?.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 rounded-2xl border-4 border-[#020406] text-black">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="flex-1 text-center xl:text-left space-y-4">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
              {user.name} <span className="text-emerald-500">.node</span>
            </h1>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-4">
              Registered Investor Since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
              <Fingerprint size={12} className="text-emerald-500" /> ID: {user._id.slice(-8)}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
              <Mail size={12} className="text-blue-500" /> {user.email}
            </span>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 min-w-[300px] text-center">
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] mb-2">Total Combined Value</p>
          <h2 className="text-4xl font-black text-emerald-500 italic tracking-tighter">
            €{(Number(user.balances?.get('EUR') || 0) + Number(user.balances?.get('ROI') || 0)).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ── SECONDARY DATA GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Balances Breakdown */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 space-y-8 lg:col-span-1">
          <div className="flex items-center gap-4 text-white border-b border-white/5 pb-6">
            <Wallet size={20} className="text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Asset Allocation</h3>
          </div>
          <div className="space-y-6">
            {['EUR', 'ROI', 'BTC', 'ETH'].map((currency) => (
              <div key={currency} className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{currency} Node</span>
                <span className="text-lg font-black font-mono text-white">
                  {user.balances?.get(currency) || '0.00'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Access Logs */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 space-y-8 lg:col-span-2">
          <div className="flex items-center gap-4 text-white border-b border-white/5 pb-6">
            <History size={20} className="text-blue-500" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Compliance & Security Trail</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">KYC Tier</p>
                <p className="text-xs font-black text-white uppercase">{user.kycStatus || 'Unverified'}</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Account State</p>
                <p className="text-xs font-black text-emerald-500 uppercase">Operational</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">2FA Status</p>
                <p className="text-xs font-black text-blue-500 uppercase">Enabled</p>
              </div>
            </div>
            
            <div className="pt-6">
               <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.4em] mb-4">Last Detected Access</p>
               <div className="flex items-center gap-4 text-gray-600">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold">IP Trace: 192.168.1.1 (Zurich, CH)</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
