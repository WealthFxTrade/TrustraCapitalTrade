import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Loader2, Camera, Globe, X 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function KYC() {
  const [files, setFiles] = useState({ idFront: null, idBack: null, selfie: null });
  const [previews, setPreviews] = useState({ idFront: null, idBack: null, selfie: null });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('unverified');

  const handleFileChange = (e, type) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) return toast.error("File size must be under 10MB");
      
      setFiles(prev => ({ ...prev, [type]: selected }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(selected) }));
    }
  };

  const handleUpload = async () => {
    if (!files.idFront || !files.idBack || !files.selfie) {
      return toast.error("Please provide all required identification nodes.");
    }

    setLoading(true);
    const toastId = toast.loading("Encrypting and uploading credentials...");
    
    const formData = new FormData();
    formData.append('idFront', files.idFront);
    formData.append('idBack', files.idBack);
    formData.append('selfie', files.selfie);

    try {
      // Endpoint updated to match the Admin and User controller logic
      await api.post('/user/kyc-submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus('pending');
      toast.success("Identity packet submitted successfully.", { id: toastId });
    } catch (err) {
      toast.error("Handshake failed. Protocol error.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderUploadSlot = (type, label, icon: any) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">{label}</label>
      <div className="relative group h-40 bg-black/40 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500/30 transition-all">
        {previews[type] ? (
          <>
            <img src={previews[type]} alt={type} className="w-full h-full object-cover opacity-50" />
            <button 
              onClick={() => {
                setFiles(p => ({...p, [type]: null}));
                setPreviews(p => ({...p, [type]: null}));
              }}
              className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all z-20"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white/5 rounded-xl text-gray-600 group-hover:text-emerald-500 transition-colors">
              {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">Select Node</span>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, type)} 
          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-emerald-500" size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500">Compliance Protocol v2.5.4</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight uppercase italic">Identity <span className="text-emerald-500 font-black">Verification</span></h1>
        </header>

        {status === 'unverified' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {renderUploadSlot('idFront', 'ID Front / Passport', <FileText size={24} />)}
                {renderUploadSlot('idBack', 'ID Back / Details', <FileText size={24} />)}
                <div className="md:col-span-2">
                  {renderUploadSlot('selfie', 'Identity Portrait (Holding ID)', <Camera size={24} />)}
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading || !files.idFront}
                className="w-full py-6 bg-emerald-600 text-black font-black uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all disabled:opacity-20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Initialize Sequence'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0c10] border border-emerald-500/20 rounded-[3rem] p-20 text-center shadow-2xl">
            <div className="h-24 w-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Under Audit</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-10 font-bold uppercase tracking-widest leading-loose">
              Our governance team is validating your node credentials. Clearance takes approximately 1-6 hours.
            </p>
            <button onClick={() => window.location.href = '/dashboard'} className="px-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all">
              Return to Terminal
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
