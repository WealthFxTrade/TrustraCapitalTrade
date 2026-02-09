import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // npm install react-dropzone
import { Upload, X, ShieldCheck, Camera, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/apiService';

const KYCUpload = () => {
  const [files, setFiles] = useState({ front: null, back: null, selfie: null });
  const [previews, setPreviews] = useState({ front: '', back: '', selfie: '' });
  const [docType, setDocType] = useState('passport');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onDrop = useCallback((acceptedFiles, type) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFiles(prev => ({ ...prev, [type]: file }));
    setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  }, []);

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: '' }));
  };

  const { getRootProps: getFrontProps, getInputProps: getFrontInput } = useDropzone({
    onDrop: (f) => onDrop(f, 'front'),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const { getRootProps: getSelfieProps, getInputProps: getSelfieInput } = useDropzone({
    onDrop: (f) => onDrop(f, 'selfie'),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.front || !files.selfie) return toast.error("Missing required documents");

    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('frontImage', files.front);
    formData.append('selfieImage', files.selfie);
    if (files.back) formData.append('backImage', files.back);

    setUploading(true);
    try {
      await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
      toast.success("Identity Node Transmitted for Review");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) return (
    <div className="bg-[#0a0d14] border border-white/5 p-12 rounded-[2.5rem] text-center max-w-lg mx-auto shadow-2xl">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Verification Pending</h2>
      <p className="text-slate-500 text-xs font-bold leading-relaxed mb-0 uppercase tracking-widest">
        Security Node is reviewing your documents. Settlement takes 12-24 hours.
      </p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-[#0a0d14] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30"></div>

      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
          <ShieldCheck size={14} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Identity Protocol 2.0</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Verify Identity</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Regulatory Compliance Node</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Document Type Selection */}
        <div className="grid grid-cols-3 gap-3">
          {['passport', 'national_id', 'drivers_license'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocType(type)}
              className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                docType === type ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' : 'bg-black/40 border-white/5 text-slate-500'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dropzone: Front Image */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Document Front</label>
            <div {...getFrontProps()} className={`relative h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.front ? 'border-blue-500' : 'border-white/10 bg-black/40 hover:border-blue-500/50'}`}>
              <input {...getFrontInput()} />
              {previews.front ? (
                <img src={previews.front} className="h-full w-full object-cover rounded-3xl" alt="Front Preview" />
              ) : (
                <div className="text-center p-4">
                  <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Drop Front Side</p>
                </div>
              )}
              {previews.front && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile('front'); }} className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full shadow-lg"><X size={14} /></button>
              )}
            </div>
          </div>

          {/* Dropzone: Selfie */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2">Identity Selfie</label>
            <div {...getSelfieProps()} className={`relative h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${previews.selfie ? 'border-blue-500' : 'border-white/10 bg-black/40 hover:border-blue-500/50'}`}>
              <input {...getSelfieInput()} />
              {previews.selfie ? (
                <img src={previews.selfie} className="h-full w-full object-cover rounded-3xl" alt="Selfie Preview" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Drop Selfie</p>
                </div>
              )}
              {previews.selfie && (
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile('selfie'); }} className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full shadow-lg"><X size={14} /></button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98]"
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Upload size={20} /> Transmit Identity Node</>}
        </button>
      </form>
    </div>
  );
};

export default KYCUpload;

