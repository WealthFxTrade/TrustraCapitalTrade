import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitKYC } from '../api/api';
import { ShieldCheck, Upload, Loader2, AlertCircle, ChevronLeft, AlertTriangle, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../constants/api'; // ← centralized

export default function KYC() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(user?.kycStatus || 'unsubmitted');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Basic validation
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
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a document');

    if (!confirm('Are you sure you want to upload this document? Uploaded files are permanent and used for identity verification.')) {
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);

    try {
      // Use centralized endpoint
      const endpoint = API_ENDPOINTS.KYC_SUBMIT || '/kyc/submit';
      await submitKYC(formData); // assuming submitKYC uses api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

      setStatus('pending');
      toast.success('Documents uploaded successfully. Verification in progress.');
      // Optional: navigate('/dashboard') after success
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // Pending state
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-white">
        <div className="bg-[#0a0c10] border border-white/5 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
          <div className="bg-blue-500/10 p-6 rounded-full w-fit mx-auto mb-8">
            <Loader2 className="text-blue-500 animate-spin" size={48} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Verification In Progress</h2>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            Your documents are being reviewed. This process typically takes 24–72 hours. You will be notified once complete.
          </p>
          <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest">
            Do NOT send additional funds or personal information to anyone claiming to "speed up" verification.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-10 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <header className="px-6 lg:px-20 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#05070a]/80">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          <ShieldCheck size={16} className="text-blue-500" /> Secure Verification
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        {/* Warning Banner */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={28} />
          <div>
            <h4 className="font-bold text-red-300 mb-2">Important Notice</h4>
            <p className="text-red-200 text-sm leading-relaxed">
              Never send additional money or personal information to anyone claiming to "expedite" or "fix" your verification. Legitimate platforms do NOT require extra payments for KYC. If asked, report immediately.
            </p>
          </div>
        </div>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <header className="mb-12 space-y-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Identity Verification (KYC)</h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              To comply with regulatory requirements, please upload a clear photo or scan of your government-issued ID (Passport, National ID, or Driver's License).
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
                    <img src={previewUrl} alt="Document preview" className="max-h-48 mx-auto rounded-lg shadow-lg object-contain" />
                  </div>
                ) : (
                  <div className="p-5 bg-white/5 rounded-2xl mb-6 text-blue-500">
                    <Upload size={40} />
                  </div>
                )}
                <p className="font-black italic uppercase tracking-tighter text-xl">
                  {file ? file.name : 'Choose Document'}
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-3">
                  JPG, PNG or PDF • Max 5MB • Clear & legible
                </p>
              </label>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={20} />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Make sure all four corners are visible, text is readable, and image is not blurry. Only upload your own documents.
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Uploading...
                </>
              ) : (
                <>
                  Submit for Verification <FileCheck size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
