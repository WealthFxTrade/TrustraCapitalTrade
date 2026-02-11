import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitKyc } from '../api'; // ✅ Matches your api/index.js export
import { ShieldCheck, Upload, FileText, CheckCircle2, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KYC() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('unsubmitted'); // unsubmitted, pending, verified

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a document first");

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      // ✅ Integrated with your centralized API service
      await submitKyc(formData);
      setStatus('pending');
      toast.success("Identity documents transmitted to Trustra Nodes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Secure upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
        <div className="bg-[#0a0c10] border border-white/5 p-12 rounded-[3rem] text-center max-w-md shadow-2xl animate-in zoom-in duration-500">
          <div className="bg-blue-500/10 p-6 rounded-full w-fit mx-auto mb-8">
            <Loader2 className="text-blue-500 animate-spin" size={48} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Verification Pending</h2>
          <p className="text-gray-500 text-sm mt-4 leading-relaxed font-medium">
            Our compliance node is reviewing your documents. 
            Estimated synchronization time: <span className="text-white font-bold">2–4 hours</span>.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-10 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl"
          >
            Return to Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      {/* HEADER */}
      <header className="px-6 lg:px-20 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#05070a]/80">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Exit to Dashboard
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          <ShieldCheck size={16} className="text-blue-500" /> Identity Protocol v8.4
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck size={200} />
          </div>

          <header className="mb-12 space-y-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Identity Verification</h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              To comply with <span className="text-white">2026 global financial regulations</span>, please upload a clear photo of your Passport or National ID.
            </p>
          </header>

          <form onSubmit={handleUpload} className="space-y-10">
            {/* UPLOAD BOX */}
            <div className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group ${
              file ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
            }`}>
              <input 
                type="file" 
                id="kyc-file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
                accept="image/*,application/pdf" 
              />
              <label htmlFor="kyc-file" className="cursor-pointer flex flex-col items-center">
                <div className="p-5 bg-white/5 rounded-2xl mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <p className="font-black italic uppercase tracking-tighter text-xl">
                  {file ? file.name : "Select Document"}
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-3">
                  JPG, PNG or PDF (Max 5MB)
                </p>
              </label>
            </div>

            {/* ALERT BOX */}
            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-[0.2em] font-bold">
                Ensure all four corners of the document are visible and the text is legible to avoid protocol rejection.
              </p>
            </div>

            <button 
              disabled={uploading} 
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="animate-spin" size={20} /> Transmitting...</>
              ) : (
                <>Submit for Verification <FileText size={18} /></>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

