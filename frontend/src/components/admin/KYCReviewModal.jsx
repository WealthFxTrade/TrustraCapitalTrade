import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/apiService';

const KYCReviewModal = ({ kyc, onClose, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Helper to format full image URL from backend path
  const getImgUrl = (path) => {
    const base = import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com';
    return `${base}/${path.replace(/\\/g, '/')}`;
  };

  const handleAction = async (action) => {
    if (action === 'reject' && !rejectionReason) return setShowRejectInput(true);
    
    setSubmitting(true);
    try {
      // Endpoint: PATCH /api/admin/kyc/:id/approve or /reject
      await api.patch(`/admin/kyc/${kyc._id}/${action}`, { reason: rejectionReason });
      toast.success(`Investor Node ${action === 'approve' ? 'Verified' : 'Rejected'}`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.message || "Sync Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0a0d14] border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500" /> Identity Review: {kyc.user?.fullName}
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              Doc Type: {kyc.documentType} • Node ID: {kyc._id.slice(-8)}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition">
            <X size={20} />
          </button>
        </header>

        {/* Document Grid */}
        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Document Proof</label>
            <div className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-black">
              <img src={getImgUrl(kyc.frontImage)} alt="ID Front" className="w-full h-auto" />
              <a href={getImgUrl(kyc.frontImage)} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2">Investor Selfie</label>
            <div className="group relative rounded-[2rem] overflow-hidden border border-white/5 bg-black">
              <img src={getImgUrl(kyc.selfieImage)} alt="Selfie" className="w-full h-auto" />
              <a href={getImgUrl(kyc.selfieImage)} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-2 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-8 border-t border-white/5 bg-white/[0.01]">
          {showRejectInput ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 transition">
              <textarea 
                placeholder="Specify rejection reason (e.g. Blurry Image)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-black border border-red-500/30 rounded-2xl p-4 text-xs font-bold outline-none focus:border-red-500 transition h-24"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowRejectInput(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                <button 
                  onClick={() => handleAction('reject')}
                  disabled={submitting}
                  className="flex-[2] bg-red-600 hover:bg-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Confirm Rejection"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectInput(true)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-red-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center justify-center gap-2"
              >
                <AlertCircle size={16} /> Reject Node
              </button>
              <button 
                onClick={() => handleAction('approve')}
                disabled={submitting}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Verify Investor</>}
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default KYCReviewModal;

