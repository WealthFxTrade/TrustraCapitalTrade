import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitKyc } from '../api/api'; 
import { ShieldCheck, Upload, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function KYC() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(user?.kycStatus || 'unsubmitted');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a document first");
    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      await submitKyc(formData);
      setStatus('pending');
      toast.success("Identity documents transmitted to Trustra Nodes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Secure upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending' || user?.kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-white">
        <div className="bg-[#0a0c10] border border-white/5 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
          <div className="bg-blue-500/10 p-6 rounded-full w-fit mx-auto mb-8">
            <Loader2 className="text-blue-500 animate-spin" size={48} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Verification Pending</h2>
          <p className="text-gray-500 text-sm mt-4 leading-relaxed">
            Our compliance node is reviewing your documents. Estimated synchronization: <span className="text-white font-bold">2–4 hours</span>.
          </p>
          <button onClick={() => navigate('/dashboard')} className="mt-10 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            Return to Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <header className="px-6 lg:px-20 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#05070a]/80">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft size={16} /> Exit to Dashboard
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          <ShieldCheck size={16} className="text-blue-500" /> Identity Protocol v8.4
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <header className="mb-12 space-y-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Identity Verification</h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">To comply with 2026 regulations, please upload your Passport or National ID.</p>
          </header>

          <form onSubmit={handleUpload} className="space-y-10">
            <div className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
              <input type="file" id="kyc-file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
              <label htmlFor="kyc-file" className="cursor-pointer flex flex-col items-center">
                <div className="p-5 bg-white/5 rounded-2xl mb-6 text-blue-500"><Upload size={32} /></div>
                <p className="font-black italic uppercase tracking-tighter text-xl">{file ? file.name : "Select Document"}</p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-3">JPG, PNG or PDF (Max 5MB)</p>
              </label>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">Ensure all four corners are visible and text is legible.</p>
            </div>

            <button disabled={uploading} className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-500 transition-all disabled:opacity-50">
              {uploading ? "Transmitting..." : "Authorize Identity Scan"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

