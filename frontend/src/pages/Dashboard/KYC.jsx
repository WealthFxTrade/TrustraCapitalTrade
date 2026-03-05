import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileText, UserCheck, 
  ChevronRight, Loader2, AlertCircle, Camera,
  CheckCircle2, Lock
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function KYC() {
  const { user, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form State
  const [files, setFiles] = useState({
    idFront: null,
    idBack: null,
    selfie: null
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      return toast.error("File exceeds 5MB limit");
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    if (!files.idFront || !files.idBack || !files.selfie) {
      return toast.error("All identification nodes must be uploaded.");
    }

    setLoading(true);
    const loadToast = toast.loading("Syncing Identity with Compliance Ledger...");

    try {
      const formData = new FormData();
      formData.append('idFront', files.idFront);
      formData.append('idBack', files.idBack);
      formData.append('selfie', files.selfie);

      await api.post('/user/kyc-submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Identity Sequence Initiated", { id: loadToast });
      setStep(3); // Success step
      refreshAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Encryption Handshake Failed", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* ── HEADER ── */}
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-yellow-500/10 rounded-3xl text-yellow-500 mb-6"
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Identity <span className="text-yellow-500">Audit</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] max-w-md mx-auto">
            Verification required for institutional-grade liquidity extraction.
          </p>
        </header>

        {/* ── PROGRESS RAIL ── */}
        <div className="flex justify-center mb-16 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-1.5 w-16 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0c10] border border-white/5 p-10 rounded-[3rem] text-center"
            >
              <h3 className="text-2xl font-black uppercase italic mb-6">Prerequisites</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <FileText className="mx-auto mb-4 text-yellow-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Valid ID</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <Camera className="mx-auto mb-4 text-yellow-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Clear Selfie</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <Lock className="mx-auto mb-4 text-yellow-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Encrypted</p>
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-6 bg-white text-black font-black uppercase italic tracking-[0.2em] rounded-2xl hover:bg-yellow-500 transition-all"
              >
                Begin Audit Sequence
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* ID Front */}
                <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                  <input 
                    type="file" 
                    id="idFront" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'idFront')} 
                    accept="image/*"
                  />
                  <label htmlFor="idFront" className="cursor-pointer block text-center">
                    {files.idFront ? (
                      <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={32} />
                    ) : (
                      <Upload className="mx-auto mb-4 text-gray-700" size={32} />
                    )}
                    <p className="text-[10px] font-black uppercase tracking-widest">ID Card / Passport Front</p>
                    {files.idFront && <p className="text-[9px] text-emerald-500 mt-2">{files.idFront.name}</p>}
                  </label>
                </div>

                {/* ID Back */}
                <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                  <input 
                    type="file" 
                    id="idBack" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'idBack')} 
                    accept="image/*"
                  />
                  <label htmlFor="idBack" className="cursor-pointer block text-center">
                    {files.idBack ? (
                      <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={32} />
                    ) : (
                      <Upload className="mx-auto mb-4 text-gray-700" size={32} />
                    )}
                    <p className="text-[10px] font-black uppercase tracking-widest">ID Card / Passport Back</p>
                    {files.idBack && <p className="text-[9px] text-emerald-500 mt-2">{files.idBack.name}</p>}
                  </label>
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                <input 
                  type="file" 
                  id="selfie" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'selfie')} 
                  accept="image/*"
                />
                <label htmlFor="selfie" className="cursor-pointer block text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/10">
                    {files.selfie ? <CheckCircle2 className="text-emerald-500" size={32} /> : <Camera className="text-gray-700" size={32} />}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Live Identification Portrait (Selfie)</p>
                </label>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic tracking-[0.2em] rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-20 shadow-2xl shadow-yellow-500/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Upload Documents <ChevronRight size={18} /></>}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0a0c10] border border-white/5 p-12 rounded-[3.5rem] text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <UserCheck size={40} />
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Audit Pending</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed mb-10">
                Your data is being cross-referenced with global compliance standards. Status update within 24-48 hours.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-10 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Return to Terminal
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECURITY FOOTER ── */}
        <footer className="mt-12 flex items-center justify-center gap-8 opacity-20">
           <div className="flex items-center gap-2">
             <Lock size={12} />
             <span className="text-[8px] font-black uppercase tracking-widest">AES-256</span>
           </div>
           <div className="flex items-center gap-2">
             <ShieldCheck size={12} />
             <span className="text-[8px] font-black uppercase tracking-widest">ISO 27001</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
