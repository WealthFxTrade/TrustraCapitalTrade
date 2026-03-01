import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; 
import { Upload, X, ShieldCheck, Camera, FileText, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api'; 

const KYCUpload = () => {
  const [files, setFiles] = useState({ front: null, back: null, selfie: null });
  const [previews, setPreviews] = useState({ front: '', back: '', selfie: '' });
  const [docType, setDocType] = useState('passport');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onDrop = useCallback((acceptedFiles, type) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // File Size Guard (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File exceeds 5MB limit");
    }

    setFiles(prev => ({ ...prev, [type]: file }));
    setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  }, []);

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: '' }));
  };

  // Dropzone Configurations
  const createDropzone = (type) => ({
    onDrop: (f) => onDrop(f, type),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const { getRootProps: getFrontProps, getInputProps: getFrontInput } = useDropzone(createDropzone('front'));
  const { getRootProps: getBackProps, getInputProps: getBackInput } = useDropzone(createDropzone('back'));
  const { getRootProps: getSelfieProps, getInputProps: getSelfieInput } = useDropzone(createDropzone('selfie'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.front || !files.selfie) return toast.error("Missing required documents");
    if (docType !== 'passport' && !files.back) return toast.error("Back side required for this document type");

    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('frontImage', files.front);
    formData.append('selfieImage', files.selfie);
    if (files.back) formData.append('backImage', files.back);

    setUploading(true);
    try {
      await api.post('/user/kyc-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
      toast.success("Identity Node Transmitted for Review");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload protocol failed");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) return (
    <div className="bg-[#0a0d14] border border-white/5 p-12 rounded-[2.5rem] text-center max-w-lg mx-auto shadow-2xl animate-in zoom-in-95">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
        <CheckCircle2 size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Verification Pending</h2>
      <p className="text-slate-500 text-[10px] font-black leading-relaxed uppercase tracking-[0.2em]">
        Security Node is reviewing your documents.<br/>Settlement takes 12-24 business hours.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-[#0a0d14] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-700">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
          <ShieldCheck size={14} className="text-yellow-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500">Identity Protocol v8.4.2</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Secure <span className="text-yellow-500">Onboarding</span></h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Zürich Compliance Node</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Document Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['passport', 'national_id', 'drivers_license'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocType(type)}
              className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                docType === type ? 'bg-yellow-500 border-yellow-400 text-black shadow-xl shadow-yellow-500/20' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dropzone: Front */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Document Front</label>
            <div {...getFrontProps()} className={`relative h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.front ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 bg-black/40 hover:border-yellow-500/30'}`}>
              <input {...getFrontInput()} />
              {previews.front ? (
                <img src={previews.front} className="h-full w-full object-cover rounded-3xl" alt="Front Preview" />
              ) : (
                <div className="text-center p-4">
                  <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Drop Front Side</p>
                </div>
              )}
              {previews.front && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile('front'); }} className="absolute -top-2 -right-2 bg-rose-600 p-1.5 rounded-full shadow-lg"><X size={12} /></button>
              )}
            </div>
          </div>

          {/* Dropzone: Back (Conditional) */}
          {docType !== 'passport' && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Document Back</label>
              <div {...getBackProps()} className={`relative h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.back ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 bg-black/40 hover:border-yellow-500/30'}`}>
                <input {...getBackInput()} />
                {previews.back ? (
                  <img src={previews.back} className="h-full w-full object-cover rounded-3xl" alt="Back Preview" />
                ) : (
                  <div className="text-center p-4">
                    <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Drop Back Side</p>
                  </div>
                )}
                {previews.back && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeFile('back'); }} className="absolute -top-2 -right-2 bg-rose-600 p-1.5 rounded-full shadow-lg"><X size={12} /></button>
                )}
              </div>
            </div>
          )}

          {/* Dropzone: Selfie */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Facial Scan (Selfie)</label>
            <div {...getSelfieProps()} className={`relative h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.selfie ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10 bg-black/40 hover:border-yellow-500/30'}`}>
              <input {...getSelfieInput()} />
              {previews.selfie ? (
                <img src={previews.selfie} className="h-full w-full object-cover rounded-3xl" alt="Selfie Preview" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Drop Selfie</p>
                </div>
              )}
              {previews.selfie && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile('selfie'); }} className="absolute -top-2 -right-2 bg-rose-600 p-1.5 rounded-full shadow-lg"><X size={12} /></button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-4">
          <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-gray-500 uppercase font-black italic tracking-widest leading-relaxed">
            Final Node Clearance: Documents must be original and unexpired. Digitally altered images will result in permanent node termination.
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-yellow-500/10 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={20} /> Transmit Identity Node</>}
        </button>
      </form>
    </div>
  );
};

export default KYCUpload;
