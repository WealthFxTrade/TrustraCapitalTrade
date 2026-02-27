import React, { useState } from 'react';
import { User, Lock, Save, LogOut, LayoutDashboard, History, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api'; // ← unified api
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../constants/api';

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = API_ENDPOINTS.USER_PROFILE || '/user/profile';
      await api.put(endpoint, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        ...(formData.newPassword && { password: formData.newPassword }),
      });

      toast.success('Profile updated successfully');
      // Optional: refresh user in context
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight">Trustra</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Account</div>
          <Link to="/profile" className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 p-3 rounded-lg uppercase text-[11px] font-bold tracking-widest">
            <User size={18} /> Profile
          </Link>
          <Link to="/transactions" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] font-bold tracking-widest">
            <History size={18} /> History
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-end px-8">
          <button onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition">
            Logout <LogOut size={16} />
          </button>
        </header>

        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Profile Settings</h1>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-[#161b29] border border-gray-800 rounded-3xl p-8 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                <User size={16} /> Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mt-10 mb-4 flex items-center gap-2">
                <Lock size={16} /> Change Password
              </h3>
              <div className="space-y-4">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password (leave blank to keep current)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
