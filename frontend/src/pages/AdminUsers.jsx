// src/pages/AdminUsers.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Edit3, Shield, Mail, 
  Wallet, Trash2, ArrowLeft, RefreshCw,
  CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingBalance, setEditingBalance] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to retrieve user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateBalance = async (userId) => {
    if (!editingBalance || isNaN(editingBalance)) return toast.error("Enter a valid amount");
    
    try {
      await api.put(`/admin/users/${userId}/balance`, { balance: Number(editingBalance) });
      toast.success("User balance recalibrated");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Balance update failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">User Directory</h1>
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em]">Investor Identity Management</p>
            </div>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search by Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs focus:border-yellow-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* User List Table */}
          <div className="lg:col-span-2 bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <th className="p-6">Investor</th>
                    <th className="p-6">Balance</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="4" className="p-20 text-center"><RefreshCw className="animate-spin mx-auto text-yellow-500" /></td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-6">
                        <p className="text-sm font-black">{u.fullName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{u.email}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-black text-emerald-500 italic">€{(u.balance || 0).toLocaleString()}</p>
                      </td>
                      <td className="p-6">
                        {u.kycStatus === 'verified' ? (
                          <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <AlertCircle size={10} /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => { setSelectedUser(u); setEditingBalance(u.balance); }}
                          className="p-2 bg-white/5 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspection & Edit Panel */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-[#0a0c10] border border-yellow-500/30 rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-10 duration-500">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl italic shadow-lg shadow-yellow-500/20">
                    {selectedUser.fullName.charAt(0)}
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white"><XCircle size={24} /></button>
                </div>

                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{selectedUser.fullName}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">UID: {selectedUser._id.slice(-10)}</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Override Balance (EUR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-black">€</span>
                    <input 
                      type="number"
                      value={editingBalance}
                      onChange={(e) => setEditingBalance(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-xl font-black outline-none focus:border-yellow-500"
                    />
                  </div>
                  <button 
                    onClick={() => handleUpdateBalance(selectedUser._id)}
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 transition-all"
                  >
                    Apply Correction
                  </button>
                </div>

                <div className="space-y-3">
                   <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Account Protocols</p>
                   <div className="flex flex-wrap gap-2">
                      <span className="bg-white/5 p-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} className="text-blue-500" /> Send Email
                      </span>
                      <button className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={12} /> Suspend
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0a0c10]/50 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center h-full flex flex-col justify-center items-center">
                <Shield size={48} className="text-gray-800 mb-6 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Select an investor profile to initiate inspection protocol.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
