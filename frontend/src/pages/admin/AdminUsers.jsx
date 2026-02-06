import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserX, UserCheck, RefreshCw, Wallet, Edit3, X } from 'lucide-react';
import api from '../../api/apiService';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBalance, setEditingBalance] = useState(null); // Tracks user being edited
  const [newBalance, setNewBalance] = useState({ USD: 0, totalProfit: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to synchronize with Trustra User Database');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, blocked) => {
    try {
      await api.post('/admin/users/toggle-block', { userId, blocked: !blocked });
      toast.success(blocked ? 'User Unblocked' : 'User Restricted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user security status');
    }
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/update-balance', {
        userId: editingBalance._id,
        balances: { USD: Number(newBalance.USD) },
        totalProfit: Number(newBalance.totalProfit)
      });
      toast.success('Trustra Wallet Updated Successfully');
      setEditingBalance(null);
      fetchUsers();
    } catch (err) {
      toast.error('Balance Sync Failed');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold italic">User Management</h1>
          <p className="text-gray-500 text-sm">Oversee accounts and financial liquidity across the platform.</p>
        </div>
        <button onClick={fetchUsers} className="bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-white transition">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-[#0f121d] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#05070a] text-gray-500 text-[10px] uppercase tracking-[2px] font-black">
              <tr>
                <th className="p-5">Investor Details</th>
                <th className="p-5">Wallets (Main / Profit)</th>
                <th className="p-5">Access Tier</th>
                <th className="p-5 text-right">Status</th>
                <th className="p-5 text-right">Administrative Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-white uppercase tracking-tight">{user.fullName || user.name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{user.email}</div>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-[9px] text-gray-600 uppercase font-black">Main</div>
                        <div className="font-bold text-indigo-400">€{(user.balances?.USD || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-600 uppercase font-black">Profit</div>
                        <div className="font-bold text-green-400">€{(user.totalProfit || 0).toLocaleString()}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingBalance(user);
                          setNewBalance({ USD: user.balances?.USD || 0, totalProfit: user.totalProfit || 0 });
                        }}
                        className="p-2 bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="p-5">
                    {user.role === 'admin' ? (
                      <span className="bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center w-fit gap-1">
                        <ShieldCheck size={12} /> Root Admin
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 border border-gray-800 py-1 rounded-full">Standard</span>
                    )}
                  </td>

                  <td className="p-5 text-right">
                    <span className={`text-[10px] font-black uppercase ${user.blocked ? 'text-red-500' : 'text-green-500'}`}>
                      {user.blocked ? 'Restricted' : 'Authorized'}
                    </span>
                  </td>

                  <td className="p-5 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleBlock(user._id, user.blocked)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition shadow-lg ${
                          user.blocked ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                        }`}
                      >
                        {user.blocked ? 'Release Account' : 'Suspend Account'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BALANCE EDITOR MODAL */}
      {editingBalance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f121d] border border-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setEditingBalance(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-2">Adjust Funds</h2>
            <p className="text-gray-500 text-sm mb-6 uppercase text-[10px] font-bold tracking-widest">User: {editingBalance.fullName}</p>
            
            <form onSubmit={handleUpdateBalance} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Main Wallet (€)</label>
                <input 
                  type="number"
                  value={newBalance.USD}
                  onChange={(e) => setNewBalance({...newBalance, USD: e.target.value})}
                  className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Profit Wallet (€)</label>
                <input 
                  type="number"
                  value={newBalance.totalProfit}
                  onChange={(e) => setNewBalance({...newBalance, totalProfit: e.target.value})}
                  className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-xl font-bold text-green-400 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase text-xs tracking-[2px] shadow-lg shadow-indigo-600/20">
                Update User Liquidity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

