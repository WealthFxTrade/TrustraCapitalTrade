import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Loader2, Camera 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function KYC() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('unverified'); // unverified, pending, verified

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a valid document.");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      await api.post('/user/kyc-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('pending');
      toast.success("Document transmitted to Zurich Compliance.");
    } catch (err) {
      toast.error("Transmission failed. Check network link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-yellow-500" size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/60">
              Identity Protocol
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Clearance Level 1</h1>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-2">
            Required for institutional node access
          </p>
        </div>

        {status === 'unverified' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl"
          >
            <div className="flex items-center gap-6 mb-10 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
              <AlertCircle className="text-yellow-500" size={24} />
              <p className="text-[11px] font-bold uppercase leading-relaxed opacity-70">
                Upload a clear photo of your Passport or National ID. Documents are encrypted and stored in an offline vault.
              </p>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 group-hover:border-yellow-500/30 transition-all">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-48 h-32 object-cover rounded-xl border border-white/20" />
                  ) : (
                    <>
                      <div className="p-5 bg-white/5 rounded-full text-yellow-500">
                        <Camera size={32} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        Drop file or click to browse
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full py-8 bg-white text-black font-black uppercase italic tracking-tighter rounded-[2rem] flex items-center justify-center gap-4 hover:bg-yellow-500 transition-all disabled:opacity-20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Begin Handshake'}
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-emerald-500/20 rounded-[3rem] p-16 text-center"
          >
            <div className="h-20 w-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black italic uppercase mb-4">Transmission Received</h2>
            <p className="text-sm opacity-40 max-w-xs mx-auto mb-10 uppercase font-bold tracking-widest leading-loose">
              Zurich HQ is verifying your credentials. Status will update within 12–24 hours.
            </p>
            <div className="h-[1px] w-full bg-white/5 mb-10" />
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 hover:text-white transition-colors"
            >
              Return to Terminal
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
