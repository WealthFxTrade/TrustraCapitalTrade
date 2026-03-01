import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// UP TWO LEVELS: from /pages/Dashboard/ to /src/
import { submitKYC } from '../../api/api'; 
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../constants/api'; 
import { 
  ShieldCheck, Upload, Loader2, AlertCircle, 
  ChevronLeft, AlertTriangle, FileCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function KYC() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(user?.kycStatus || 'unsubmitted');

  // Memory Cleanup: Revoke the object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      return toast.error('Only JPG, PNG, or PDF allowed');
    }
    if (selectedFile.size > maxSize) {
      return toast.error('File too large (max 5MB)');
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a document');

    if (!window.confirm('Confirm Identity Packet Transmission? This action is permanent.')) {
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      // Logic assumes submitKYC is a function in /src/api/api.js
      await submitKYC(formData); 
      setStatus('pending');
      toast.success('Identity Pack Transmitted. Audit in progress.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Protocol Interrupted. Try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-white">
        <div className="bg-[#0a0c10] border border-white/5 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
          <div className="bg-blue-500/10 p-6 rounded-full w-fit mx-auto mb-8 text-blue-500">
            <Loader2 className="animate-spin" size={48} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Audit In Progress</h2>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed uppercase tracking-widest font-bold opacity-50">
            Verification typically takes 24–72 hours.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-10 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      <header className="px-6 lg:px-20 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#05070a]/80">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          <ShieldCheck size={16} className="text-blue-500" /> Secure Protocol 8.4
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        <div className="bg-red-900/20 border border-red-500/30 rounded-3xl p-6 flex items-start gap-4 animate-pulse">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-widest text-red-400 mb-1">Security Warning</h4>
            <p className="text-red-200/60 text-[10px] uppercase font-bold leading-relaxed">
              Never pay fees to "speed up" verification. Official Trustra audits are free of charge.
            </p>
          </div>
        </div>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <header className="mb-12 space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Clearance <span className="text-blue-500">Audit</span></h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
              Upload Passport, National ID, or Driver's License.
            </p>
          </header>

          <form onSubmit={handleUpload} className="space-y-10">
            <div className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30'}`}>
              <input
                type="file"
                id="kyc-file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
              />
              <label htmlFor="kyc-file" className="cursor-pointer flex flex-col items-center">
                {previewUrl ? (
                  <div className="mb-6">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-2xl border border-white/10" />
                  </div>
                ) : (
                  <div className="p-5 bg-white/5 rounded-2xl mb-6 text-blue-500">
                    <Upload size={40} />
                  </div>
                )}
                <p className="font-black italic uppercase tracking-tighter text-xl">
                  {file ? file.name : 'Staging Document'}
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-3">
                  JPG/PNG/PDF • MAX 5MB
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-500 transition-all disabled:opacity-20 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <>Transmit Identity <FileCheck size={18} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
