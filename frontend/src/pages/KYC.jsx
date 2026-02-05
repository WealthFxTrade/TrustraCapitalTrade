import React, { useState } from 'react';
import { submitKyc } from '../api';
import { ShieldCheck, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KYCPage() {
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
      await submitKyc(formData);
      setStatus('pending');
      toast.success("Identity documents submitted for review");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center max-w-md">
          <div className="bg-amber-500/10 p-5 rounded-full w-fit mx-auto mb-6">
            <Loader2 className="text-amber-500 animate-spin" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
          <p className="text-slate-500 text-sm">Our compliance team is reviewing your documents. This usually takes 2-4 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={150} /></div>
          
          <header className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
            <p className="text-slate-400 text-sm leading-relaxed">To comply with 2026 global financial regulations, please upload a clear photo of your Passport or National ID.</p>
          </header>

          <form onSubmit={handleUpload} className="space-y-8">
            <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
              <input type="file" id="kyc-file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
              <label htmlFor="kyc-file" className="cursor-pointer flex flex-col items-center">
                <div className="p-4 bg-slate-800 rounded-2xl mb-4 text-indigo-400"><Upload size={32} /></div>
                <p className="font-bold text-lg">{file ? file.name : "Select Document"}</p>
                <p className="text-xs text-slate-500 mt-2">JPG, PNG or PDF (Max 5MB)</p>
              </label>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex gap-4">
              <AlertCircle className="text-indigo-500 shrink-0" size={20} />
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">Ensure all four corners of the document are visible and the text is legible to avoid rejection.</p>
            </div>

            <button disabled={uploading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-2">
              {uploading ? <Loader2 className="animate-spin" /> : "Submit for Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

