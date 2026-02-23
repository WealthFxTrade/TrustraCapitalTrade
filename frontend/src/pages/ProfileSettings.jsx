import React, { useState } from 'react';
import { User, Lock, ShieldCheck, Save, LogOut, TrendingUp, LayoutDashboard, History, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export default function ProfileSettings({ user, logout }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/profile', formData);
      toast.success("Trustra Identity Updated");
    } catch (err) {
      toast.error("Update failed. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      {/* SIDEBAR (Matches Dashboard) */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight">TrustraCapital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Account</div>
          <Link to="/profile" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <User size={18} /> MY PROFILE
          </Link>
          <Link to="/transactions" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <History size={18} /> HISTORY
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          <h1 className="text-2xl font-bold italic">Profile Settings</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* FORM SECTION */}
            <form onSubmit={handleUpdateProfile} className="md:col-span-2 space-y-6">
              <div className="bg-[#161b29] border border-gray-800 rounded-3xl p-8 space-y-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                  <User size={16} /> Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
                
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mt-10 mb-4 flex items-center gap-2">
                  <Lock size={16} /> Security Credentials
                </h3>
                <div className="space-y-4">
                  <input 
                    type="password" 
                    placeholder="New Password (Leave blank to keep current)"
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[3px] transition shadow-lg shadow-indigo-600/20">
                  {loading ? "Syncing..." : "Update Trustra Identity"}
                </button>
              </div>
            </form>

            {/* STATUS CARDS */}
            <div className="space-y-6">
              <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><ShieldCheck size={20} /></div>
                  <h4 className="font-bold text-xs uppercase tracking-widest">Account Status</h4>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Verification Level</p>
                <p className="text-sm font-black text-green-400 mt-1 italic">Verified Investor</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

