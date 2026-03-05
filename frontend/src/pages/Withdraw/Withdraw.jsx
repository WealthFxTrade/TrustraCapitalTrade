import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, Landmark, Cpu, 
  ArrowRight, Info, CheckCircle2, Loader2, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'BTC',
    address: '',
    network: 'Mainnet'
  });

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await api.post('/transactions/withdraw', formData);
      setStep(3); // Success state
      toast.success("Extraction Protocol Initialized");
    } catch (err) {
      toast.error(err.response?.data?.message || "Authorization Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-4xl mx-auto mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/60 hover:text-yellow-500 mb-6">
          <ArrowLeft size={14} /> Back to Terminal
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Fund Extraction Node</h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem]">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Amount (EUR)</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-black italic focus:border-yellow-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Target Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-sm focus:border-yellow-500 outline-none" placeholder="Destination Hash" />
                  </div>
                  <button onClick={() => setStep(2)} disabled={!formData.amount || !formData.address} className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic rounded-2xl flex items-center justify-center gap-3 disabled:opacity-20">
                    Authorize Extraction <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.03] border border-yellow-500/30 p-10 rounded-[3rem] text-center">
                <ShieldCheck className="text-yellow-500 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-black italic uppercase mb-10">Security Verification</h3>
                <button onClick={handleWithdraw} disabled={loading} className="w-full py-6 bg-emerald-500 text-black font-black uppercase italic rounded-2xl">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Finalize Handshake'}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.03] border border-emerald-500/30 p-12 rounded-[3.5rem] text-center">
                <CheckCircle2 className="text-emerald-500 mx-auto mb-6" size={64} />
                <h3 className="text-3xl font-black italic uppercase mb-4">Request Transmitted</h3>
                <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-white/10 rounded-full font-black uppercase text-[10px]">Return to Dashboard</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Network Speed</p>
            <div className="flex items-center gap-4 text-yellow-500">
              <Cpu size={20} />
              <span className="text-xs font-bold uppercase">Priority Node Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
