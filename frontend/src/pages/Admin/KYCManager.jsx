import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, XCircle, CheckCircle, Eye, Loader2, User,
  ChevronRight, Maximize2, AlertTriangle, Clock, X, FileText, Camera
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';

export default function KYCManager() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingKYCs();
  }, []);

  const fetchPendingKYCs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/kyc');
      if (res.data?.success) {
        setSubmissions(res.data.users || []);
      }
    } catch (err) {
      toast.error("Protocol Sync Failure: Identity Ledger Unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    const notes = status === 'rejected' ? window.prompt("Reason for rejection:") : "Identity verified by Auditor";
    if (status === 'rejected' && !notes) return;

    setActionLoading(true);
    const toastId = toast.loading(`Committing Ledger Update...`);
    
    try {
      // Aligned with backend: PUT /admin/kyc/update { userId, status, notes }
      const { data } = await api.put('/admin/kyc/update', { 
        userId, 
        status: status === 'verified' ? 'verified' : 'rejected',
        notes 
      });

      if (data.success) {
        toast.success(`Node Identity ${status === 'verified' ? 'Authorized' : 'Blacklisted'}`, { id: toastId });
        setSelectedAudit(null);
        fetchPendingKYCs();
      }
    } catch (err) {
      toast.error("Protocol Update Failed: Database Mismatch", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to ensure image URLs are correct
  const getImgUrl = (path) => {
    if (!path) return 'https://placeholder.com';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}${path}`;
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      
      {/* ── TERMINAL HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 text-yellow-500 mb-2">
            <ShieldCheck size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Auth Level: Auditor</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            KYC <span className="text-yellow-500">Oversight</span> Terminal
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
            Identity Verification & AML Compliance Queue
          </p>
        </div>

        <div className="bg-[#0a0c10] border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Pending Audits: <span className="text-white ml-2">{submissions.length}</span>
          </span>
        </div>
      </header>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-yellow-500" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 italic">Scanning Identity Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT: AUDIT QUEUE ── */}
          <div className="lg:col-span-5 space-y-4 max-h-[75vh] overflow-y-auto pr-4 no-scrollbar">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-6 px-4 italic">Inbound Sequence</h3>

            <AnimatePresence>
              {submissions.map((sub, index) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedAudit(sub)}
                  className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all relative group overflow-hidden ${
                    selectedAudit?._id === sub._id
                      ? 'bg-yellow-500/10 border-yellow-500 shadow-2xl shadow-yellow-500/5'
                      : 'bg-[#0a0c10] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedAudit?._id === sub._id ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-500'
                      }`}>
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-yellow-500 transition-colors">
                          {sub.name || 'Anonymous Node'}
                        </p>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                          {sub.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={selectedAudit?._id === sub._id ? 'text-yellow-500' : 'text-gray-800'} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {submissions.length === 0 && (
              <div className="p-20 text-center bg-[#0a0c10] rounded-[3.5rem] border border-dashed border-white/5">
                <ShieldCheck size={48} className="mx-auto text-gray-800 mb-6" />
                <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.4em]">Protocol Clear: No Identities Pending Audit</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: INSPECTION PANEL ── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedAudit ? (
                <motion.div
                  key={selectedAudit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0a0c10] border border-white/10 rounded-[3.5rem] p-8 lg:p-12 sticky top-12 shadow-2xl"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12">
                    <div>
                      <h4 className="text-3xl font-black uppercase italic tracking-tighter">Identity Audit</h4>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2 font-mono">
                        UID: <span className="text-yellow-500">{selectedAudit._id}</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'rejected')}
                        className="px-6 py-4 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                      >
                        Blacklist
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'verified')}
                        className="px-8 py-4 bg-yellow-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                    {/* ID Front */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <FileText size={14}/> ID Document Front
                      </div>
                      <div className="rounded-3xl border border-white/10 overflow-hidden bg-black group relative">
                         <img src={getImgUrl(selectedAudit.idFrontUrl)} alt="ID Front" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                            <Maximize2 className="text-white" />
                         </div>
                      </div>
                    </div>

                    {/* ID Back */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <FileText size={14}/> ID Document Back
                      </div>
                      <div className="rounded-3xl border border-white/10 overflow-hidden bg-black group relative">
                         <img src={getImgUrl(selectedAudit.idBackUrl)} alt="ID Back" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    </div>

                    {/* Selfie */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <Camera size={14}/> Biometric Selfie Match
                      </div>
                      <div className="rounded-3xl border border-white/10 overflow-hidden bg-black group relative">
                         <img src={getImgUrl(selectedAudit.selfieUrl)} alt="Selfie" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center p-20 text-center opacity-20">
                  <div className="space-y-6">
                    <Maximize2 size={64} className="mx-auto" />
                    <p className="text-xs font-black uppercase tracking-[0.4em]">Select Node for Deep Audit</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

