import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Search, 
  ChevronRight,
  UserPlus,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("User Registry Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 lg:p-10 bg-[#05070a] min-h-screen text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-500">
            <Users size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Population Registry</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Investor <span className="text-slate-800">/</span> Database</h1>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search Name/Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs focus:border-blue-500 outline-none transition"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-95">
            <UserPlus size={20} />
          </button>
        </div>
      </header>

      {/* USER TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4 text-center">KYC Status</th>
                <th className="px-6 py-4 text-right">EUR Balance</th>
                <th className="px-6 py-4 text-right">BTC Balance</th>
                <th className="px-6 py-4 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-600 animate-pulse font-bold">Querying User Nodes...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-600 font-bold uppercase text-xs tracking-widest">No matching investors found</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => toast(`Opening terminal for ${u.fullName}`)}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{u.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {u.kycStatus === 'verified' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Verified
                          </div>
                        ) : u.kycStatus === 'pending' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest animate-pulse">
                            <ShieldAlert size={12} /> Pending
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Unsubmitted
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-white font-mono">€{(u.balances?.EUR || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-orange-400 font-mono">₿{(u.balances?.BTC || 0).toLocaleString(undefined, { minimumFractionDigits: 6 })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

