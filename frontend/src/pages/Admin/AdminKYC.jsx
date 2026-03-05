import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Eye, Check, X, Clock, ExternalLink } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminKYC() {
  const [pendingKyc, setPendingKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchKycQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/kyc/pending');
      setPendingKyc(res.data.queue);
    } catch (err) {
      toast.error("Identity Ledger Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKycQueue(); }, []);

  const handleDecision = async (kycId, status) => {
    const loadId = toast.loading(`Updating Node to ${status}...`);
    try {
      await api.put(`/admin/kyc/verify`, { kycId, status });
      toast.success(`Identity ${status === 'verified' ? 'Validated' : 'Rejected'}`, { id: loadId });
      fetchKycQueue();
    } catch (err) {
      toast.error("Handshake Protocol Failure", { id: loadId });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Identity Validation Queue</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manual Document Inspection Required</p>
        </div>
        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
            {pendingKyc.length} Nodes Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {pendingKyc.map((item) => (
          <div key={item._id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-500">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-black italic text-sm uppercase">{item.user?.username}</h4>
                  <p className="text-[10px] text-gray-500 font-mono lowercase">{item.user?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Doc Type</p>
                <p className="text-[10px] font-bold text-white uppercase">{item.documentType || 'National ID'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Document Previews */}
              {[
                { label: 'Front ID', path: item.frontImage },
                { label: 'Selfie Node', path: item.selfieImage }
              ].map((img, idx) => (
                <div key={idx} className="relative group aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/${img.path}`} 
                    alt={img.label}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40">
                    <button 
                      onClick={() => setSelectedImage(`${import.meta.env.VITE_API_URL}/${img.path}`)}
                      className="p-3 bg-white text-black rounded-full"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <span className="absolute bottom-3 left-3 text-[8px] font-black uppercase bg-black/80 px-2 py-1 rounded tracking-widest">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleDecision(item._id, 'rejected')}
                className="flex-1 py-4 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all"
              >
                Reject
              </button>
              <button 
                onClick={() => handleDecision(item._id, 'verified')}
                className="flex-1 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              >
                Verify Node
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingKyc.length === 0 && !loading && (
        <div className="py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem]">
          <ShieldCheck className="mx-auto text-gray-800 mb-6" size={64} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">All Identities Synchronized</p>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-12" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-10 right-10 text-white hover:text-yellow-500 transition-colors">
            <X size={40} />
          </button>
          <img src={selectedImage} alt="Full Resolution" className="max-w-full max-h-full rounded-3xl border border-white/10 shadow-2xl" />
        </div>
      )}
    </div>
  );
}
