import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, Landmark, Cpu, 
  ArrowRight, Info, AlertTriangle, CheckCircle2,
  Loader2, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Terminal State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    network: 'Mainnet',
    pin: ''
  });

  const availableBalance = user?.balances?.EUR_PROFIT || 0;

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      // Logic aligns with the TransactionController.js we built
      await api.post('/transactions/withdraw', {
        amount: Number(formData.amount),
        asset: formData.asset,
        address: formData.address,
        network: formData.network
      });

      setStep(3); // Move to Success Node
      toast.success("Extraction Protocol Initialized");
    } catch (err) {
      toast.error(err.response?.data?.message || "Authorization Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Terminal
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Fund Extraction Node</h1>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">Protocol: Liquidity Clearance v8.6</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT: INTERACTIVE TERMINAL */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Landmark size={20} />
                  </div>
                  <h3 className="text-xl font-black italic uppercase">Clearance Parameters</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Select Extraction Asset</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['BTC', 'USDT'].map(asset => (
                        <button
                          key={asset}
                          onClick={() => setFormData({...formData, asset})}
                          className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${
                            formData.asset === asset ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' : 'border-white/10 bg-white/5 opacity-40'
                          }`}
                        >
                          <span className="font-black italic">{asset}</span>
                          <div className={`h-4 w-4 rounded-full border-2 ${formData.asset === asset ? 'border-yellow-500 bg-yellow-500' : 'border-white/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Amount (EUR Equivalent)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic focus:outline-none focus:border-yellow-500 transition-all"
                      />
                      <button 
                        onClick={() => setFormData({...formData, amount: availableBalance})}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-yellow-500 hover:text-white transition-colors"
                      >
                        Max Limit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Target Receiving Address</label>
                    <input 
                      type="text"
                      placeholder="Enter Destination Hash"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-sm focus:outline-none focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    disabled={!formData.amount || !formData.address}
                    className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic tracking-tighter rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-20"
                  >
                    Authorize Extraction <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.03] border border-yellow-500/30 p-10 rounded-[3rem] text-center"
              >
                <ShieldCheck className="text-yellow-500 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-black italic uppercase mb-2">Security Verification</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-10">Confirm transaction via internal node</p>
                
                <div className="bg-white/5 p-6 rounded-2xl mb-10 text-left space-y-4 border border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-40 uppercase font-bold">Total Payout</span>
                    <span className="font-black">€{Number(formData.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-40 uppercase font-bold">Asset Type</span>
                    <span className="font-black text-yellow-500">{formData.asset}</span>
                  </div>
                </div>

                <button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full py-6 bg-emerald-500 text-black font-black uppercase italic tracking-tighter rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Finalize Handshake'}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="mt-6 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                >
                  Edit Parameters
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-emerald-500/30 p-12 rounded-[3.5rem] text-center"
              >
                <div className="h-24 w-24 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-4">Request Transmitted</h3>
                <p className="text-sm opacity-60 max-w-xs mx-auto mb-10">Your extraction is currently being audited by Zurich Compliance. Funds will reflect in your vault shortly.</p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-4 bg-white/10 rounded-full font-black uppercase text-[10px] hover:bg-white/20 transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: SIDEBAR INFO */}
        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Available for Extraction</p>
            <h2 className="text-3xl font-black italic text-yellow-500">
              €<CountUp end={availableBalance} decimals={2} duration={1} />
            </h2>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <Wallet className="text-yellow-500/50" size={20} />
              <div className="text-[9px] font-bold uppercase opacity-60">Instant Liquidity Node Active</div>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-start gap-4">
              <Info className="text-yellow-500 mt-1" size={18} />
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Audit Protocol</h4>
                <p className="text-[11px] opacity-60 mt-2 leading-relaxed">Large extractions ( {'>'} €10,000 ) require manual clearance from Zurich HQ.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Cpu className="text-yellow-500 mt-1" size={18} />
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Network Speed</h4>
                <p className="text-[11px] opacity-60 mt-2 leading-relaxed">BTC confirmations typically resolve within 15–45 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
