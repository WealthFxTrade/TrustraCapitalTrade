import React, { useState } from 'react';
import { 
  X, 
  Euro, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import { toast } from 'react-hot-toast';

export default function BalanceEditorModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [walletType, setWalletType] = useState('EUR'); // EUR or ROI
  const [operation, setOperation] = useState('add'); // add or subtract

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return toast.error("Invalid Asset Value");

    setLoading(true);
    try {
      const payload = {
        amount: Number(amount),
        walletType,
        operation
      };

      // Ensure your backend has this specific override route
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${user._id}/balance-override`, payload);
      
      toast.success(`Ledger Adjusted: ${operation === 'add' ? '+' : '-'}€${amount} to ${walletType}`);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment Protocol Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6 border border-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">
            Balance <span className="text-emerald-500">Override</span>
          </h3>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mt-2">
            Target Node: {user.email}
          </p>
        </header>

        <form onSubmit={handleAdjustBalance} className="space-y-8">
          {/* Toggle Operation */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                operation === 'add' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent border-white/5 text-gray-500'
              }`}
            >
              <Plus size={14} /> Credit
            </button>
            <button
              type="button"
              onClick={() => setOperation('subtract')}
              className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                operation === 'subtract' ? 'bg-rose-500 text-white border-rose-500' : 'bg-transparent border-white/5 text-gray-500'
              }`}
            >
              <Minus size={14} /> Debit
            </button>
          </div>

          {/* Wallet Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-2">Protocol Pool</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setWalletType('EUR')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  walletType === 'EUR' ? 'bg-white/5 border-emerald-500/50 text-white' : 'border-white/5 text-gray-700'
                }`}
              >
                <Euro size={20} />
                <span className="text-[9px] font-black uppercase">Capital (EUR)</span>
              </button>
              <button
                type="button"
                onClick={() => setWalletType('ROI')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  walletType === 'ROI' ? 'bg-white/5 border-emerald-500/50 text-white' : 'border-white/5 text-gray-700'
                }`}
              >
                <TrendingUp size={20} />
                <span className="text-[9px] font-black uppercase">Yield (ROI)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-2">Value Adjustment</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white text-xl font-mono focus:border-emerald-500/50 outline-none"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-black">€</span>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-rose-500 shrink-0" size={18} />
            <p className="text-[9px] text-gray-500 font-black uppercase leading-relaxed">
              Caution: This action bypasses the automated audit engine and directly modifies the database ledger. Ensure documentation exists for this override.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-emerald-500 text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Authorize Settlement"}
          </button>
        </form>
      </div>
    </div>
  );
}
