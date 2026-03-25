// src/pages/Admin/AdminKYC.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  Check,
  X,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminKYC() {
  const [pendingKyc, setPendingKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchKycQueue = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/api/admin/kyc/pending');
      setPendingKyc(res.data.queue || res.data.data || res.data || []);
    } catch (err) {
      console.error('[KYC FETCH ERROR]', err);
      toast.error(err.response?.data?.message || 'Failed to load KYC queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKycQueue();
  }, []);

  const handleDecision = async (kycId, status) => {
    const action = status === 'verified' ? 'verify' : 'reject';
    const confirmMsg = status === 'verified'
      ? 'Approve this identity? User will gain full access.'
      : 'Reject this KYC? User must resubmit documents.';

    if (!window.confirm(confirmMsg)) return;

    const toastId = toast.loading(`Updating identity status to ${status}...`);

    try {
      await api.put('/api/admin/kyc/verify', { kycId, status });
      toast.success(`Identity ${status === 'verified' ? 'approved' : 'rejected'} successfully`, { id: toastId });
      fetchKycQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update KYC status', { id: toastId });
    }
  };

  const openImage = (path) => {
    if (!path) return toast.error('Image not available');
    // Adjust URL if your backend serves images under /uploads or similar
    const fullUrl = path.startsWith('http') ? path : `\( {import.meta.env.VITE_API_URL || ''}/ \){path}`;
    setSelectedImage(fullUrl);
  };

  if (loading && pendingKyc.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020408]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-400 font-black uppercase tracking-[0.4em]">Loading Identity Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            IDENTITY <span className="text-yellow-500">VALIDATION</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">
            Manual Document Review Queue
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-xs font-black uppercase tracking-widest text-yellow-400">
            {pendingKyc.length} PENDING VERIFICATIONS
          </div>

          <button
            onClick={fetchKycQueue}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            REFRESH QUEUE
          </button>
        </div>
      </div>

      {pendingKyc.length === 0 ? (
        <div className="py-32 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
          <ShieldCheck className="mx-auto text-emerald-500 mb-6" size={64} />
          <p className="text-lg font-black text-gray-400">All identities have been processed</p>
          <p className="text-xs text-gray-600 mt-2">No pending KYC requests in the queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {pendingKyc.map((item) => (
            <div
              key={item._id}
              className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-8 hover:border-yellow-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Clock size={24} className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{item.user?.username}</h4>
                    <p className="text-xs text-gray-500 font-mono">{item.user?.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Document Type</p>
                  <p className="text-sm font-bold text-white">{item.documentType || 'National ID'}</p>
                </div>
              </div>

              {/* Document Previews */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Front / ID', path: item.frontImage },
                  { label: 'Selfie', path: item.selfieImage },
                ].map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openImage(img.path)}
                    className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-yellow-500/50 transition-all group"
                  >
                    {img.path ? (
                      <img
                        src={img.path.startsWith('http') ? img.path : `\( {import.meta.env.VITE_API_URL || ''}/ \){img.path}`}
                        alt={img.label}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                      <Eye size={28} className="text-white" />
                    </div>
                    <div className="absolute bottom-3 left-3 text-[9px] font-black uppercase bg-black/70 px-3 py-1 rounded tracking-widest">
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleDecision(item._id, 'rejected')}
                  className="flex-1 py-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  REJECT APPLICATION
                </button>
                <button
                  onClick={() => handleDecision(item._id, 'verified')}
                  className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all"
                >
                  VERIFY IDENTITY
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 z-10 bg-black/70 hover:bg-black p-3 rounded-full text-white"
            >
              <X size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Document Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
