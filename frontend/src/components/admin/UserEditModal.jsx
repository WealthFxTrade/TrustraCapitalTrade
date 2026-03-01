import React, { useState } from 'react';
import { X, Save, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function UserEditModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    kycStatus: user.kycStatus || 'pending',
    role: user.role || 'user',
    eurBalance: user.balances?.EUR || 0,
    btcBalance: user.balances?.BTC || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic maps to your PUT /users/:id route
      await api.put(`/admin/users/${user._id}`, formData);
      toast.success("Investor Node Updated");
      onUpdate(); // Refresh the list
      onClose();
    } catch (err) {
      toast.error("Protocol Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-sm">
      <div className="bg-[#0a0f1e] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-rose-500/5">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Modify Entity</h2>
            <p className="text-[10px] font-mono text-gray-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">EUR Liquidity</label>
              <input 
                type="number"
                value={formData.eurBalance}
                onChange={(e) => setFormData({...formData, eurBalance: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2">BTC Liquidity</label>
              <input 
                type="number"
                step="any"
                value={formData.btcBalance}
                onChange={(e) => setFormData({...formData, btcBalance: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-rose-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Compliance Status</label>
            <select 
              value={formData.kycStatus}
              onChange={(e) => setFormData({...formData, kycStatus: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:border-rose-500/50"
            >
              <option value="pending">Pending Review</option>
              <option value="verified">Verified / Compliant</option>
              <option value="rejected">Rejected / High Risk</option>
            </select>
          </div>

          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-3 items-center">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <p className="text-[9px] text-gray-500 uppercase font-bold italic leading-relaxed">
              Caution: Modifications are logged to the Audit Protocol. Manual balance overrides bypass the automated node yields.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Save className="animate-spin" size={16}/> : <ShieldCheck size={16}/>}
            Commit Changes to Node
          </button>
        </form>
      </div>
    </div>
  );
}
