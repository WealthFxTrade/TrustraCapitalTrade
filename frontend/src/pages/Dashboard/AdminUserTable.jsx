// src/pages/Dashboard/AdminUserTable.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, 
  MoreVertical, Edit3, ShieldAlert, 
  PlusCircle, MinusCircle, CheckCircle2 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminUserTable() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Security Breach: Failed to fetch directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by Identity or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs focus:border-yellow-500 outline-none transition-all uppercase tracking-widest font-black"
          />
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
          Sync Directory
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                <th className="px-8 py-6">Investor</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Capital Assets</th>
                <th className="px-8 py-6">Registration</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Node Directory...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black border border-yellow-500/20 uppercase">
                        {u.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{u.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500 font-bold lowercase tracking-normal">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white italic">€{u.balance?.toLocaleString() || '0.00'}</p>
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Available Liquidity</p>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-yellow-500/10 hover:text-yellow-500 rounded-lg transition-colors text-gray-600" title="Credit Balance">
                        <PlusCircle size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-gray-600" title="Restrict Node">
                        <ShieldAlert size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
