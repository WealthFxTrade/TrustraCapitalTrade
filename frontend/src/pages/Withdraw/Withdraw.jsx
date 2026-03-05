import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShieldCheck, Cpu, ArrowRight, 
  CheckCircle2, Loader2, Wallet, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 🛰️ Added for balance sync
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // 🛰️ Hook into Global Protocol State
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC', // Renamed from 'asset' to match backend
    address: '',
  });

  const handleWithdraw = async () => {
    // Basic Protocol Validation
    if (Number(formData.amount) > (user?.balances?.ROI || 0)) {
      return toast.error("Insufficient Yield Node Liquidity");
    }

    setLoading(true);
    const loadId = toast.loading("Encrypting Extraction Packet...");

    try {
      // 🔗 SYNCED: Endpoint changed from /transactions to /user
      const res = await api.post('/user/withdraw', formData);
      
      // ✅ ATOMIC SYNC: Update the global AuthContext immediately
      setUser({ balances: res.data.balances });
      
      setStep(3); // Move to Success state
      toast.success("Extraction Protocol Initialized", { id: loadId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Authorization Failed", { id: loadId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-4xl mx-auto mb-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 mb-6 transition-all"
        >
          <ArrowLeft size={14} /> Back to Terminal
        </button>
        <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter">Fund Extraction Node</h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="s1" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl"
              >
                <div className="space-y-8">
                  <div className="flex gap-4">
                    {['BTC', 'ETH'].map(coin => (
                      <button
                        key={coin}
                        onClick={() => setFormData({...formData, currency: coin})}
                        className={`flex-1 py-4 rounded-2xl font-black italic uppercase text-xs border transition-all ${formData.currency === coin ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 border-white/10 text-gray-500'}`}
                      >
                        {coin} Network
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Amount (EUR)</label>
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60">Max: €{user?.balances?.ROI?.toFixed(2)}</span>
                    </div>
                    <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic focus:border-yellow-500 outline-none transition-all" 
                      placeholder="0.00" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Target {formData.currency} Address</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-sm focus:border-yellow-500 outline-none transition-all" 
                      placeholder={`Destination ${formData.currency} Hash`} 
                    />
                  </div>

                  <button 
                    onClick={() => setStep(2)} 
                    disabled={!formData.amount || !formData.address || formData.amount < 50} 
                    className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic rounded-2xl flex items-center justify-center gap-3 disabled:opacity-20 transition-all hover:bg-white"
                  >
                    Authorize Extraction <ArrowRight size={20} />
                  </button>
                  {formData.amount > 0 && formData.amount < 50 && (
                    <p className="text-center text-[9px] font-black uppercase text-red-500/60 tracking-widest">Minimum Extraction: €50.00</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="s2" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white/[0.03] border border-yellow-500/30 p-10 rounded-[3rem] text-center"
              >
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-yellow-500" size={40} />
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">Security Verification</h3>
                <p className="text-gray-500 text-xs mb-10 leading-relaxed uppercase font-bold tracking-widest">
                  Confirming extraction of <span className="text-white">€{formData.amount}</span> to {formData.currency} node <br/>
                  <span className="text-yellow-500/50 font-mono text-[10px] break-all">{formData.address}</span>
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-6 bg-white/5 text-white font-black uppercase italic rounded-2xl hover:bg-white/10">Cancel</button>
                  <button onClick={handleWithdraw} disabled={loading} className="flex-[2] py-6 bg-emerald-500 text-black font-black uppercase italic rounded-2xl hover:bg-white transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Finalize Handshake'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="s3" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white/[0.03] border border-emerald-500/30 p-12 rounded-[3.5rem] text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-4 tracking-tighter">Request Transmitted</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Verification Pending via Zurich HQ</p>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase italic text-xs hover:bg-yellow-500 transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SIDEBAR INFO ── */}
        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Network Status</p>
            <div className="flex items-center gap-4 text-yellow-500 mb-6">
              <Cpu size={20} className="animate-pulse" />
              <span className="text-xs font-black uppercase italic">Priority Node Active</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                <span>Verification Time</span>
                <span className="text-white">1-6 Hours</span>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                <span>Protocol Fee</span>
                <span className="text-emerald-500">0.00%</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={14} className="text-yellow-500/50 mt-1" />
                <p className="text-[8px] font-bold text-gray-600 uppercase leading-loose">
                  Ensure the target address is correct. Blockchain transactions are irreversible once verified by Zurich HQ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
