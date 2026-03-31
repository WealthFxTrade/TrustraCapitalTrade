import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { 
  Search, UserMinus, UserCheck, Edit3, 
  Wallet, TrendingUp, ShieldAlert, Loader2 
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      toast.error("Failed to fetch user directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusToggle = async (userId, isBanned) => {
    try {
      await api.put(`/admin/users/${userId}`, { banned: !isBanned });
      toast.success(isBanned ? "User Unbanned" : "User Banned");
      fetchUsers();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleManualAdjustment = async (userId) => {
    const amount = prompt("Enter amount to add/subtract (e.g. 500 or -500):");
    if (!amount || isNaN(amount)) return;

    const walletType = prompt("Type 'main' for Main Wallet or 'profit' for Profit Wallet:");
    if (!['main', 'profit'].includes(walletType)) return toast.error("Invalid wallet type");

    try {
      await api.post('/admin/users/update-balance', {
        userId,
        amount: Number(amount),
        walletType,
        type: Number(amount) > 0 ? 'credit' : 'debit',
        description: "Admin Manual Adjustment"
      });
      toast.success("Balance Synchronized");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 text-gray-500 font-black uppercase tracking-widest">Accessing User Nodes...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">User <span className="text-indigo-500">Directory</span></h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Manage Investor Access & Liquidity</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f1218] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/50 transition"
          />
        </div>
      </header>

      <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] text-gray-500 uppercase tracking-[0.3em]">
            <tr>
              <th className="px-8 py-6 font-black">Investor Node</th>
              <th className="px-8 py-6 font-black text-center">Main Wallet</th>
              <th className="px-8 py-6 font-black text-center">Profit Wallet</th>
              <th className="px-8 py-6 font-black text-center">Plan Status</th>
              <th className="px-8 py-6 text-right">Clearance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u._id} className={`hover:bg-white/[0.02] transition-colors ${u.banned ? 'opacity-40' : ''}`}>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-black text-white italic uppercase text-sm">{u.fullName}</span>
                    <span className="text-[9px] text-gray-600 font-bold">{u.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-mono font-bold text-gray-300">
                  €{u.balances?.EUR?.toLocaleString() || 0}
                </td>
                <td className="px-8 py-6 text-center font-mono font-bold text-emerald-400">
                  €{u.balances?.EUR_PROFIT?.toLocaleString() || 0}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-md ${u.isPlanActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-gray-800 text-gray-500'}`}>
                    {u.isPlanActive ? u.plan || 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleManualAdjustment(u._id)}
                      className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition"
                      title="Adjust Balance"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleStatusToggle(u._id, u.banned)}
                      className={`p-3 rounded-xl border transition ${u.banned ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : 'bg-red-600/10 border-red-500/20 text-red-500'}`}
                      title={u.banned ? "Unban" : "Ban"}
                    >
                      {u.banned ? <UserCheck size={16} /> : <UserMinus size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

