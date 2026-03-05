import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, ShieldAlert, X, Save, TrendingUp, Wallet } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Modal State
  const [editData, setEditData] = useState({ amount: '', balanceType: 'EUR', type: 'add' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Handshake failed with Registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Writing to Ledger...");
    try {
      await api.put(`/admin/users/${editingUser._id}/balance`, editData);
      toast.success("Ledger Synchronized", { id: loadId });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Override Denied", { id: loadId });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* ── HEADER & SEARCH ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Identity Registry</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input 
            type="text" placeholder="Search Node ID/Email..."
            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-yellow-500 text-xs font-bold transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── USER TABLE ── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-6">Investor Node</th>
              <th className="p-6">Capital (EUR)</th>
              <th className="p-6">Yield (ROI)</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-bold italic text-sm text-white">{u.username}</span>
                    <span className="text-[10px] font-mono text-gray-500">{u.email}</span>
                  </div>
                </td>
                <td className="p-6 font-mono text-xs font-bold text-white">€{u.balances?.EUR?.toLocaleString() || 0}</td>
                <td className="p-6 font-mono text-xs font-bold text-yellow-500">€{u.balances?.ROI?.toLocaleString() || 0}</td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => { setEditingUser(u); setEditData({ ...editData, amount: '' }); }}
                    className="p-3 bg-white/5 rounded-xl hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── OVERRIDE MODAL ── */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0c10] border border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black italic uppercase italic">Balance Override</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white"><X /></button>
              </div>

              <form onSubmit={handleUpdateBalance} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" onClick={() => setEditData({...editData, balanceType: 'EUR'})}
                    className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${editData.balanceType === 'EUR' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
                  >
                    <Wallet size={14} className="inline mr-2" /> Capital
                  </button>
                  <button 
                    type="button" onClick={() => setEditData({...editData, balanceType: 'ROI'})}
                    className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${editData.balanceType === 'ROI' ? 'bg-yellow-500 text-black border-yellow-500' : 'border-white/10 text-gray-500'}`}
                  >
                    <TrendingUp size={14} className="inline mr-2" /> Yield
                  </button>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                  {['add', 'subtract'].map(op => (
                    <button
                      key={op} type="button" onClick={() => setEditData({...editData, type: op})}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${editData.type === op ? 'bg-white/10 text-white' : 'text-gray-600'}`}
                    >
                      {op}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount (EUR)</label>
                  <input 
                    type="number" required placeholder="0.00"
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-yellow-500 font-bold focus:border-yellow-500 outline-none"
                    value={editData.amount} onChange={(e) => setEditData({...editData, amount: e.target.value})}
                  />
                </div>

                <button className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all">
                  Confirm Ledger Write <Save size={18} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
