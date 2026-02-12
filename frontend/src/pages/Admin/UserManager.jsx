import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { User, Wallet, ShieldCheck, Search, Edit3, Trash2 } from 'lucide-react';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to sync with User Node");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjustBalance = async (userId) => {
    const amount = window.prompt("Enter amount to ADD (positive) or SUBTRACT (negative):");
    if (!amount || isNaN(amount)) return;

    try {
      await api.patch(`/admin/users/${userId}/balance`, { amount: Number(amount) });
      toast.success("Balance synchronized successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Adjustment failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-600 uppercase tracking-[0.5em]">Syncing User Directory...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Investor Directory</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em] mt-1">Global Network Oversight — v8.4.1</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by Email or Name..."
              className="w-full bg-[#0f121d] border border-white/5 rounded-2xl p-4 pl-12 text-xs focus:border-indigo-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#0f121d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Investor</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Wallets (EUR)</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Node Address</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 font-bold uppercase text-xs border border-indigo-500/20">
                          {u.email[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white">Main: <span className="text-indigo-400">€{(u.balances?.get('EUR') || 0).toLocaleString()}</span></p>
                        <p className="text-xs font-black text-gray-500">Profit: <span className="text-emerald-500">€{(u.balances?.get('EUR_PROFIT') || 0).toLocaleString()}</span></p>
                      </div>
                    </td>
                    <td className="p-6">
                      <code className="text-[10px] font-mono text-gray-600 group-hover:text-indigo-400 transition-colors">
                        {u.btcAddress || 'No Node Derived'}
                      </code>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button 
                        onClick={() => handleAdjustBalance(u._id)}
                        className="p-3 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-xl transition text-gray-500"
                        title="Adjust Balance"
                      >
                        <Wallet size={16} />
                      </button>
                      <button className="p-3 bg-white/5 hover:bg-rose-600 hover:text-white rounded-xl transition text-gray-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

