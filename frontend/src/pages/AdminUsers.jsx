import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Users, Search, UserMinus, UserCheck, 
  ShieldAlert, MoreHorizontal, Mail, 
  Ban, Filter, Loader2, ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async (p = 1, search = '') => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/users?page=${p}&search=${search}&limit=12`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error("Database Link Severed: Could not sync user directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, searchTerm);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'DEACTIVATE' : 'ACTIVATE';
    if (!window.confirm(`PROTOCOL OVERRIDE: ${action} this node?`)) return;

    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !currentStatus });
      toast.success(`Node ${action}D successfully`);
      fetchUsers(page, searchTerm);
    } catch (err) {
      toast.error("Authorization Failure: Override rejected");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Users className="text-rose-500" /> Node <span className="text-rose-500">Directory</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">
            Centralized User Management & Access Control
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full xl:w-auto gap-3">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              type="text" 
              placeholder="Search Name, Email, or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:border-rose-500/50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-2xl transition-all shadow-lg shadow-rose-900/20">
            <Filter size={20} />
          </button>
        </form>
      </div>

      

      {/* USER LISTING */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-[3rem] overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Scanning Database Clusters...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                <tr>
                  <th className="px-8 py-6">Investor Profile</th>
                  <th className="px-8 py-6">KYC Status</th>
                  <th className="px-8 py-6">Asset Value (EUR)</th>
                  <th className="px-8 py-6">Node Status</th>
                  <th className="px-8 py-6 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode='popLayout'>
                  {users.map((user) => (
                    <motion.tr 
                      layout
                      key={user._id} 
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black italic text-rose-500 border border-white/10">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-white">{user.fullName}</p>
                            <p className="text-[9px] text-gray-600 font-mono mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${
                          user.kyc?.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          user.kyc?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-gray-500/10 text-gray-500 border-white/10'
                        }`}>
                          {user.kyc?.status || 'unverified'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-white">€{(user.balances?.EUR || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-rose-500 font-bold mt-0.5">Yield: €{(user.balances?.EUR_PROFIT || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></span>
                          <span className="text-[9px] font-black uppercase text-gray-400">{user.isActive ? 'Active' : 'Offline'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            className={`p-2 rounded-lg transition-all ${user.isActive ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500'} hover:text-white`}
                            title={user.isActive ? "Deactivate Node" : "Activate Node"}
                          >
                            {user.isActive ? <Ban size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="p-8 bg-white/5 flex justify-between items-center border-t border-white/5">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Total Nodes Detected: {pagination.total || 0}
          </p>
          <div className="flex gap-2">
            {[...Array(pagination.pages || 0)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                  page === i + 1 ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
