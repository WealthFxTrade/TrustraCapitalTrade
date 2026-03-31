// src/components/admin/BalanceAdjustmentModal.jsx - Production v8.4.1
import React, { useState } from 'react';
import { X, Plus, Minus, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function BalanceAdjustmentModal({ user, onClose, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit'); // deposit or withdrawal
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Invalid Capital Amount");

    setIsSubmitting(true);
    try {
      const { data } = await api.put(`/admin/users/${user._id}/balance`, {
        amount: parseFloat(amount),
        type,
        description: description || `Manual ${type} adjustment by Admin`
      });

      toast.success(data.message, { icon: '💰' });
      onUpdate(); // Refresh the parent table
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment Protocol Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020408]/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Fiscal Override</h2>
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-1">Target: {user.fullName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleOverride} className="space-y-8">
          {/* Toggle Switch */}
          <div className="grid grid-cols-2 gap-4 p-1.5 bg-black/40 border border-white/5 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                type === 'deposit' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Plus size={14} /> Credit
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                type === 'withdrawal' ? 'bg-red-500 text-black shadow-lg shadow-red-500/10' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Minus size={14} /> Debit
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Adjustment Value (EUR)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-2xl font-black italic text-white focus:border-yellow-500 outline-none transition-all placeholder:text-gray-800"
            />
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Override Justification</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Manual deposit verification or correction"
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-yellow-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Warning Box */}
          <div className="flex gap-4 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
            <p className="text-[9px] font-bold text-yellow-200/50 uppercase leading-relaxed tracking-wider">
              Warning: This action will immediately modify the user's ledger and is irreversible within the current block.
            </p>
          </div>

          {/* Submit */}
          <button
            disabled={isSubmitting}
            className="w-full py-5 bg-white hover:bg-yellow-500 text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>Commit Changes <ShieldCheck size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
