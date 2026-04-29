// src/pages/Admin/UserIdentityDetail.jsx
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, History, Wallet, MapPin, Mail,
  ArrowLeft, UserCog, Ban, Fingerprint, Save, Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function UserIdentityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit State
  const [editBalances, setEditBalances] = useState({
    EUR: 0, ROI: 0, BTC: 0, ETH: 0, INVESTED: 0
  });

  const fetchUserDetail = async () => {
    try {
      const { data } = await api.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
      if (data.success) {
        setUser(data.user);
        // Map backend balance object to edit state
        setEditBalances({
          EUR: data.user.availableBalance || 0,
          ROI: data.user.accruedROI || 0,
          BTC: data.user.btcBalance || 0,
          ETH: data.user.ethBalance || 0,
          INVESTED: data.user.principal || 0
        });
      }
    } catch (err) {
      toast.error("Node Retrieval Failed");
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserDetail(); }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${id}/balances`, editBalances);
      toast.success("Ledger Synchronized Successfully");
      fetchUserDetail();
    } catch (err) {
      toast.error("Failed to commit changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-40 text-center animate-pulse font-black uppercase tracking-[0.5em] text-gray-800">
      Interrogating Database...
    </div>
  );

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
            Restrict Node (Ban)
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={saving}
            className="px-8 py-3 bg-emerald-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Commit Ledger Changes
          </button>
        </div>
      </div>

      {/* NODE IDENTITY CARD */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-12 flex flex-col xl:flex-row gap-12 items-center">
        <div className="relative">
          <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black italic shadow-2xl">
            {user.name?.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 rounded-2xl border-4 border-black text-black">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="flex-1 text-center xl:text-left space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
            {user.name} <span className="text-emerald-500">.node</span>
          </h1>
          <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
              <Fingerprint size={12} className="text-emerald-500" /> ID: {user._id}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
              <Mail size={12} className="text-blue-500" /> {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* EDITABLE LEDGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 space-y-8 lg:col-span-1">
          <div className="flex items-center gap-4 text-white border-b border-white/5 pb-6">
            <Wallet size={20} className="text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Asset Override</h3>
          </div>
          <div className="space-y-6">
            {Object.keys(editBalances).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{key} Balance</label>
                <input 
                  type="number"
                  value={editBalances[key]}
                  onChange={(e) => setEditBalances({...editBalances, [key]: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 font-mono text-emerald-400 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* COMPLIANCE TRAIL */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 space-y-8 lg:col-span-2">
          <div className="flex items-center gap-4 text-white border-b border-white/5 pb-6">
            <History size={20} className="text-blue-500" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Security Parameters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl">
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-4">KYC STATUS</p>
              <p className={`text-xl font-black italic ${user.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                {user.isVerified ? 'VERIFIED' : 'PENDING'}
              </p>
            </div>
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl">
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-4">ACCOUNT PROTECTION</p>
              <p className="text-xl font-black text-blue-500 italic">ENCRYPTED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

