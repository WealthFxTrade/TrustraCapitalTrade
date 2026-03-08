// src/pages/Withdraw/Withdraw.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

/**
 * Withdraw - Institutional Extraction Protocol
 * Features a 3-step verification flow: Input -> Handshake -> Broadcast
 */
export default function Withdraw() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC',
    address: '',
  });

  // Calculate liquidity availability
  const availableRoi = user?.balances?.ROI || 0;

  /**
   * handleWithdraw - Finalizes the extraction and updates the global ledger state
   */
  const handleWithdraw = async () => {
    // Protocol Validation
    if (Number(formData.amount) > availableRoi) {
      return toast.error("Insufficient Yield Node Liquidity");
    }

    setLoading(true);
    const loadId = toast.loading("Encrypting Extraction Packet...");

    try {
      // 🔗 Execute the withdrawal request to the backend
      const res = await api.post('/user/withdraw', formData);

      // ✅ ATOMIC SYNC: Update balances while preserving user identity metadata
      setUser({ 
        ...user, 
        balances: res.data.balances 
      });

      setStep(3); // Transition to Success State
      toast.success("Extraction Protocol Initialized", { id: loadId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Authorization Failed", { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="max-w-4xl mx-auto mb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 mb-6 transition-all"
        >
          <ArrowLeft size={14} /> Back to Terminal
        </button>
        <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">
          Fund <span className="text-yellow-500 not-italic font-light">Extraction</span> Node
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            
            {/* ── STEP 1: CONFIGURATION ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden"
              >
                <div className="space-y-8 relative z-10">
                  {/* Network Selection */}
                  <div className="flex gap-4">
                    {['BTC', 'ETH'].map(coin => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setFormData({ ...formData, currency: coin })}
                        className={`flex-1 py-4 rounded-2xl font-black italic uppercase text-xs border transition-all ${
                          formData.currency === coin 
                            ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' 
                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {coin} Network
                      </button>
                    ))}
                  </div>

                  {/* Amount Input */}
                  <div>
                    <div className="flex justify-between mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Liquidation Amount (EUR)</label>
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60">
                        Node Capacity: €{availableRoi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic focus:border-yellow-500 outline-none transition-all placeholder:text-white/5"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: availableRoi.toString() })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block italic">Target {formData.currency} Destination Hash</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-white/5"
                      placeholder={`0x... / SegWit Address`}
                    />
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!formData.amount || !formData.address || formData.amount < 50}
                      className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic rounded-2xl flex items-center justify-center gap-3 disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Authorize Extraction <ArrowRight size={20} />
                    </button>
                    {formData.amount > 0 && formData.amount < 50 && (
                      <p className="text-center mt-4 text-[9px] font-black uppercase text-rose-500 tracking-[0.2em] animate-pulse">
                        Minimum Protocol Requirement: €50.00
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: HANDSHAKE (CONFIRMATION) ── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.03] border border-yellow-500/30 p-10 rounded-[3rem] text-center backdrop-blur-2xl"
              >
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-yellow-500" size={40} />
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">Security Handshake</h3>
                <div className="bg-black/40 rounded-3xl p-6 mb-10 space-y-2 border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Liquidating</p>
                  <p className="text-3xl font-black text-white italic">€{Number(formData.amount).toFixed(2)}</p>
                  <p className="text-[10px] font-mono text-yellow-500/50 break-all mt-4">{formData.address}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)} 
                    className="flex-1 py-6 bg-white/5 text-white font-black uppercase italic rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={handleWithdraw} 
                    disabled={loading} 
                    className="flex-[2] py-6 bg-emerald-500 text-black font-black uppercase italic rounded-2xl hover:bg-white transition-all shadow-lg shadow-emerald-500/10"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Finalize Protocol'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: BROADCAST (SUCCESS) ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-emerald-500/30 p-12 rounded-[3.5rem] text-center"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500" size={48} />
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-4 tracking-tighter text-white">Broadcast Successful</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12 italic">
                  Verification Pending via Zurich Mainnet Nodes
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase italic text-xs hover:bg-yellow-500 transition-all shadow-xl shadow-white/5"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SIDEBAR METADATA ── */}
        <div className="space-y-6">
          <div className="bg-[#05070a] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
              <Wallet size={100} />
            </div>
            
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-6 italic">Network Status</p>
            
            <div className="flex items-center gap-4 text-yellow-500 mb-8">
              <Cpu size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase italic tracking-widest">Priority Extraction Path</span>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                <span>Verification Time</span>
                <span className="text-white">1-6 Hours</span>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 border-t border-white/5 pt-4">
                <span>Network Protocol</span>
                <span className="text-white">SegWit v2</span>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 border-t border-white/5 pt-4">
                <span>Protocol Fee</span>
                <span className="text-emerald-500 font-bold">0.00% (Node Free)</span>
              </div>
            </div>

            <div className="mt-10 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle size={14} className="text-yellow-500/50 mt-1 shrink-0" />
                <p className="text-[8px] font-bold text-gray-500 uppercase leading-loose italic">
                  Institutional Notice: Ensure your destination hash is precise. Zurich Mainnet cannot reverse packets once the handshake is finalized.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
