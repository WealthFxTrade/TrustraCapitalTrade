import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, 
  MoreVertical, UserMinus, UserCheck, 
  Network, TrendingUp 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (err) {
        toast.error("Failed to sync user ledger.");
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-8 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">User Directory</h1>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Protocol Membership Oversight</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search by Hash or Identity..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl focus:border-yellow-500 outline-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">User Identity</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Balance</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Node Hierarchy (Referrer)</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-white/[0.01] transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 font-black italic text-xs">
                      {user.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black italic">{user.username}</p>
                      <p className="text-[10px] opacity-30 font-mono">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 font-mono text-emerald-400 font-bold">
                  €{user.totalBalance?.toLocaleString()}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <Network size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {user.referredBy || 'Direct Entry'}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    user.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-all opacity-40 hover:opacity-100">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
