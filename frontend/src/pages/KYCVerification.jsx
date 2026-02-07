import React, { useState } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle, 
  AlertCircle, RefreshCw, Eye, X 
} from 'lucide-react';
import api from '../api/apiService';

export default function KYCVerification() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('kycDocument', file);

    try {
      const res = await api.post('/user/kyc-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) setStatus('success');
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] min-h-screen text-white pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-2xl mb-4 text-blue-500 border border-blue-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Identity Verification</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Secure 2026 Compliance Standard • AML-Ready
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {status === 'success' ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Documents Submitted</h2>
              <p className="text-slate-400 text-sm">Your identity is being verified by our audit team. Estimated time: 2-4 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Accepted: Passport, National ID, or Driver's License</p>
                
                <div className="relative group">
                  {!preview ? (
                    <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-blue-600/5 transition-all cursor-pointer">
                      <div className="bg-white/5 p-4 rounded-2xl mb-4 text-slate-500 group-hover:text-blue-500 transition-colors">
                        <Upload size={32} />
                      </div>
                      <span className="text-xs font-bold text-slate-400">Click to upload document</span>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                    </label>
                  ) : (
                    <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10">
                      <img src={preview} alt="KYC Preview" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="flex gap-4">
                          <button type="button" onClick={() => setPreview(null)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 transition-colors"><X size={20}/></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
                  <AlertCircle size={16} /> Submission failed. Please check file format and retry.
                </div>
              )}

              <button 
                disabled={!file || loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <>Submit for Audit <FileText size={18} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

