// src/pages/Admin/AdminUserTable.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, XCircle, CheckCircle, Eye, Search,
  Loader2, User, AlertTriangle, ChevronRight
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminUserTable() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingKYCs = async () => {
    setLoading(true);
    try {
      // Ensure backend route is correct
      const res = await api.get('/admin/kyc/pending');
      setSubmissions(res.data?.kycs || res.data?.users || res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending KYC applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKYCs();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    const action = status === 'verified' ? 'Approve' : 'Reject';
    if (!window.confirm(`${action} this KYC application?`)) return;

    setActionLoading(true);
    try {
      const res = await api.put('/admin/kyc/update', { userId, status });
      if (res.data?.success) {
        toast.success(`KYC ${status} successfully`);
        setSelectedAudit(null);
        fetchPendingKYCs();
      }
    } catch (err) {
      toast.error('Failed to update KYC status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 text-emerald-400 mb-3">
            <ShieldCheck size={24} />
            <span className="text-xs font-black uppercase tracking-widest">Compliance Engine</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Identity Audit</h1>
          <p className="text-gray-400 mt-2">Manual verification of user credentials and document validity</p>
        </div>

        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Queue Status</p>
          <p className="text-xl font-bold text-emerald-400">{submissions.length} Pending</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Syncing with KYC Vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Audit Queue List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Pending Submissions</h3>

            {submissions.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center">
                <ShieldCheck className="mx-auto text-emerald-500/10" size={64} />
                <p className="mt-6 text-gray-500 font-medium">All applications processed</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <motion.div
                  key={sub._id}
                  onClick={() => setSelectedAudit(sub)}
                  whileHover={{ x: 8 }}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    selectedAudit?._id === sub._id
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold">{sub.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 font-mono">{sub.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={selectedAudit?._id === sub._id ? 'text-emerald-500' : 'text-gray-600'} />
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Inspection Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedAudit ? (
                <motion.div
                  key={selectedAudit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 sticky top-8 shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-white/5">
                    <div>
                      <h3 className="text-2xl font-black">Document Inspector</h3>
                      <p className="text-sm text-gray-500 font-mono">{selectedAudit.email}</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'rejected')}
                        disabled={actionLoading}
                        className="flex-1 md:flex-none px-6 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'verified')}
                        disabled={actionLoading}
                        className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Identification (Front)', url: selectedAudit.idFrontUrl },
                      { label: 'Identification (Back)', url: selectedAudit.idBackUrl },
                      { label: 'Identity Selfie', url: selectedAudit.selfieUrl, wide: true }
                    ].map((doc, idx) => (
                      doc.url && (
                        <div key={idx} className={doc.wide ? 'md:col-span-2' : ''}>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">{doc.label}</p>
                          <div 
                            className="relative group rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <img src={doc.url} alt={doc.label} className="w-full object-cover max-h-[300px] group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={32} />
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
                  <Search size={48} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Select a submission to inspect</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

