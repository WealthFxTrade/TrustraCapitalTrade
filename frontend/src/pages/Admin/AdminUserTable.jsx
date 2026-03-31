// src/pages/Admin/AdminUserTable.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, XCircle, CheckCircle, Eye, Search, 
  Loader2, User, AlertTriangle 
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function KYCManager() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingKYCs = async () => {
    setLoading(true);
    try {
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
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 text-emerald-400 mb-3">
            <ShieldCheck size={24} />
            <span className="text-xs font-medium uppercase tracking-widest">Compliance</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">KYC Verification</h1>
          <p className="text-gray-400 mt-2">Review pending identity verification requests</p>
        </div>

        <div className="text-sm text-gray-400">
          Pending Applications: <span className="text-emerald-400 font-medium">{submissions.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Audit Queue List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-6">Pending Applications</h3>

            {submissions.length === 0 ? (
              <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-20 text-center">
                <ShieldCheck className="mx-auto text-emerald-500/30" size={64} />
                <p className="mt-6 text-gray-400">No pending KYC applications</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <motion.div
                  key={sub._id}
                  onClick={() => setSelectedAudit(sub)}
                  whileHover={{ x: 8 }}
                  className={`p-8 rounded-3xl border cursor-pointer transition-all ${
                    selectedAudit?._id === sub._id 
                      ? 'bg-emerald-500/10 border-emerald-500' 
                      : 'bg-[#0a0c10] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        <User size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{sub.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-600 mt-2" />
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0a0c10] border border-white/5 rounded-3xl p-12 sticky top-8 shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h3 className="text-2xl font-semibold">Document Review</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedAudit.name} • {selectedAudit.email}</p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'rejected')}
                        disabled={actionLoading}
                        className="px-8 py-4 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-2xl transition-all disabled:opacity-50 flex items-center gap-3"
                      >
                        <XCircle size={20} /> Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAudit._id, 'verified')}
                        disabled={actionLoading}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black rounded-2xl transition-all disabled:opacity-50 flex items-center gap-3"
                      >
                        <CheckCircle size={20} /> Approve
                      </button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">ID Front</p>
                      {selectedAudit.idFrontUrl && (
                        <img 
                          src={selectedAudit.idFrontUrl} 
                          alt="ID Front" 
                          className="w-full rounded-2xl border border-white/10 cursor-pointer hover:border-emerald-500/50 transition-all"
                          onClick={() => window.open(selectedAudit.idFrontUrl, '_blank')}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">ID Back</p>
                      {selectedAudit.idBackUrl && (
                        <img 
                          src={selectedAudit.idBackUrl} 
                          alt="ID Back" 
                          className="w-full rounded-2xl border border-white/10 cursor-pointer hover:border-emerald-500/50 transition-all"
                          onClick={() => window.open(selectedAudit.idBackUrl, '_blank')}
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Selfie Verification</p>
                      {selectedAudit.selfieUrl && (
                        <img 
                          src={selectedAudit.selfieUrl} 
                          alt="Selfie" 
                          className="w-full rounded-3xl border border-white/10 cursor-pointer hover:border-emerald-500/50 transition-all max-h-96 object-cover"
                          onClick={() => window.open(selectedAudit.selfieUrl, '_blank')}
                        />
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mt-12 p-8 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-sm text-rose-400 flex gap-4">
                    <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                    <p>
                      Verify that the documents clearly show the same individual and that all text is legible. 
                      Approving grants full access to the platform.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center border border-white/5 border-dashed rounded-3xl">
                  <Eye size={64} className="text-gray-600 mb-6" />
                  <p className="text-gray-400">Select a submission from the list to review documents</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
