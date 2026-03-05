import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, XCircle, CheckCircle, Eye, 
  Search, Filter, ExternalLink, Loader2,
  User, Calendar, Clock, AlertTriangle
} from 'lucide-react';
import api from '../../api/api';
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
    try {
      const res = await api.get('/admin/kyc-pending');
      setSubmissions(res.data);
    } catch (err) {
      toast.error("Failed to sync with Identity Ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/kyc-update`, { userId, status });
      toast.success(`Identity Node ${status === 'verified' ? 'Authorized' : 'Rejected'}`);
      setSelectedAudit(null);
      fetchPendingKYCs();
    } catch (err) {
      toast.error("Protocol Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans">
      
      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
            KYC <span className="text-yellow-500">Oversight</span> Terminal
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
            Identity Verification & AML Compliance Queue
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#0a0c10] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Clock size={16} className="text-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Pending Audits: {submissions.length}
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── AUDIT QUEUE ── */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-6 px-4">Inbound Sequence</h3>
            {submissions.map((sub) => (
              <motion.div
                key={sub._id}
                onClick={() => setSelectedAudit(sub)}
                whileHover={{ x: 10 }}
                className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${
                  selectedAudit?._id === sub._id 
                  ? 'bg-yellow-500/10 border-yellow-500' 
                  : 'bg-[#0a0c10] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-tight">{sub.user?.fullName || 'Unknown Node'}</p>
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{sub.user?.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              </motion.div>
            ))}
            
            {submissions.length === 0 && (
              <div className="p-12 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                <ShieldCheck size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Protocol Clear: No Pending Audits</p>
              </div>
            )}
          </div>

          {/* ── INSPECTION PANEL ── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedAudit ? (
                <motion.div
                  key={selectedAudit._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0a0c10] border border-white/10 rounded-[3rem] p-10 sticky top-12 shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Document Inspection</h4>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">User ID: {selectedAudit.user?._id}</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(selectedAudit.user?._id, 'rejected')}
                        className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <XCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedAudit.user?._id, 'verified')}
                        className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">ID Front</p>
                      <img 
                        src={selectedAudit.idFrontUrl} 
                        alt="ID Front" 
                        className="w-full h-40 object-cover rounded-2xl border border-white/10 hover:scale-105 transition-transform cursor-pointer" 
                        onClick={() => window.open(selectedAudit.idFrontUrl)}
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">ID Back</p>
                      <img 
                        src={selectedAudit.idBackUrl} 
                        alt="ID Back" 
                        className="w-full h-40 object-cover rounded-2xl border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(selectedAudit.idBackUrl)}
                      />
                    </div>
                    <div className="col-span-2 space-y-4">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Verification Portrait (Selfie)</p>
                      <img 
                        src={selectedAudit.selfieUrl} 
                        alt="Selfie" 
                        className="w-full h-64 object-cover rounded-[2rem] border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer"
                        onClick={() => window.open(selectedAudit.selfieUrl)}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
                      Before authorizing, ensure document text is legible and portrait matches the ID identification. Once verified, the user will have full access to the Extraction Gateway.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20 border border-white/5 border-dashed rounded-[4rem]">
                   <Eye size={64} className="mb-6" />
                   <p className="text-xs font-black uppercase tracking-[0.3em]">Select a node for inspection</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
