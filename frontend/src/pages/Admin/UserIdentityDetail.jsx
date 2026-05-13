// src/pages/Admin/UserIdentityDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  History,
  Wallet,
  Mail,
  ArrowLeft,
  Fingerprint,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/api/api';
import { API_ENDPOINTS } from '@/constants/api';
import toast from 'react-hot-toast';

export default function UserIdentityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit State for balances
  const [editBalances, setEditBalances] = useState({
    EUR: 0,
    ROI: 0,
    BTC: 0,
    ETH: 0,
    INVESTED: 0
  });

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.GET_USER_DETAIL(id));

      if (res.data?.success && res.data.user) {
        const u = res.data.user;
        setUser(u);

        setEditBalances({
          EUR: u.availableBalance || 0,
          ROI: u.accruedROI || 0,
          BTC: u.btcBalance || 0,
          ETH: u.ethBalance || 0,
          INVESTED: u.principal || 0
        });
      } else {
        toast.error("User not found");
        navigate('/admin/users');
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user details");
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserDetail();
  }, [id]);

  const handleUpdateBalances = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const res = await api.put(
        API_ENDPOINTS.ADMIN.UPDATE_USER_BALANCE(id),
        editBalances
      );

      if (res.data?.success) {
        toast.success("Ledger updated successfully");
        fetchUserDetail(); // Refresh data
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update balances");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={40} />
        <p className="text-gray-500 font-mono text-sm">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-6 px-6 py-3 bg-white text-black rounded-2xl font-semibold"
        >
          Return to User List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back to Users
        </button>

        <div className="flex gap-3">
          <button className="px-6 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-sm font-semibold hover:bg-rose-500/20 transition-all">
            Restrict Account
          </button>
          <button
            onClick={handleUpdateBalances}
            disabled={saving}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-2xl flex items-center gap-2 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-12 flex flex-col xl:flex-row gap-12 items-center">
        <div className="relative">
          <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="absolute -bottom-3 -right-3 p-3 bg-emerald-500 rounded-2xl border-4 border-[#0a0c10]">
            <ShieldCheck size={24} className="text-black" />
          </div>
        </div>

        <div className="flex-1 text-center xl:text-left">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            {user.name} <span className="text-emerald-500">.node</span>
          </h1>
          <div className="flex flex-wrap justify-center xl:justify-start gap-4 mt-6">
            <span className="flex items-center gap-2 px-5 py-2 bg-white/5 rounded-2xl text-xs font-mono border border-white/10">
              <Fingerprint size={14} className="text-emerald-500" /> {user._id?.slice(0, 12)}...
            </span>
            <span className="flex items-center gap-2 px-5 py-2 bg-white/5 rounded-2xl text-xs border border-white/10">
              <Mail size={14} className="text-blue-400" /> {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-4 mb-8">
            <Wallet className="text-emerald-500" size={24} />
            <h3 className="text-lg font-bold">Asset Override</h3>
          </div>

          <div className="space-y-6">
            {Object.keys(editBalances).map((key) => (
              <div key={key}>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                  {key} Balance
                </label>
                <input
                  type="number"
                  value={editBalances[key]}
                  onChange={(e) => setEditBalances({ ...editBalances, [key]: Number(e.target.value) })}
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 font-mono text-emerald-400 focus:border-emerald-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Info */}
        <div className="lg:col-span-2 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-4 mb-8">
            <History className="text-blue-400" size={24} />
            <h3 className="text-lg font-bold">Security & Compliance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">KYC STATUS</p>
              <p className={`text-2xl font-black ${user.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                {user.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
              </p>
            </div>

            <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">ACCOUNT STATUS</p>
              <p className="text-2xl font-black text-blue-400">ACTIVE • ENCRYPTED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
