// src/pages/Admin/KycVerificationQueue.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Users, Clock, CheckCircle, XCircle, 
  RefreshCw, Loader2, Search, ArrowLeft 
} from 'lucide-react';
import api from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function KycVerificationQueue() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPendingKyc = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/kyc/pending');
      setPendingUsers(data.kycs || data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending KYC applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingKyc();
  }, [fetchPendingKyc]);

  const handleVerification = async (userId, status, email) => {
    const action = status === 'verified' ? 'Approve' : 'Reject';
    if (!window.confirm(`\( {action} KYC for \){email}?`)) return;

    setProcessingId(userId);

    try {
      const res = await api.put('/admin/kyc/update', {
        userId,
        status,
        notes: status === 'verified' ? 'KYC approved by admin' : 'KYC rejected by admin'
      });

      if (res.data?.success) {
        toast.success(`KYC \( {status} successfully for \){email}`);
        fetchPendingKyc();
      }
    } catch (err) {
      toast.error('Failed to update KYC status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = pendingUsers.filter(user =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 text-emerald-400 mb-3">
              <ShieldCheck size={24} />
              <span className="text-xs font-medium uppercase tracking-widest">Compliance</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">KYC Verification Queue</h1>
            <p className="text-gray-400 mt-2">Review and verify pending user identities</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-emerald-500 outline-none text-sm"
              />
            </div>

            <button
              onClick={fetchPendingKyc}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Queue */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
            <p className="mt-6 text-sm text-gray-400">Loading pending applications...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-20 text-center">
            <ShieldCheck className="mx-auto text-emerald-500/30" size={64} />
            <p className="mt-6 text-gray-400">No pending KYC applications at this time</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="bg-[#0a0c10] border border-white/5 rounded-3xl p-10 space-y-10 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <Users size={32} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                      Pending Review
                    </span>
                  </div>
                </div>

                {/* Document Previews */}
                <div className="grid grid-cols-3 gap-4">
                  <DocumentPreview label="ID Front" url={user.kyc?.idFrontUrl} />
                  <DocumentPreview label="ID Back" url={user.kyc?.idBackUrl} />
                  <DocumentPreview label="Selfie" url={user.kyc?.selfieUrl} />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <button
                    disabled={processingId === user._id}
                    onClick={() => handleVerification(user._id, 'verified', user.email)}
                    className="flex items-center justify-center gap-3 py-6 bg-emerald-600 hover:bg-emerald-500 text-black rounded-3xl font-medium transition-all disabled:opacity-50"
                  >
                    {processingId === user._id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Approve KYC
                  </button>

                  <button
                    disabled={processingId === user._id}
                    onClick={() => handleVerification(user._id, 'rejected', user.email)}
                    className="flex items-center justify-center gap-3 py-6 bg-rose-600/10 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-rose-400 rounded-3xl font-medium transition-all disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject KYC
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Notice */}
        <div className="mt-16 text-center text-xs text-gray-500">
          All KYC decisions are logged for compliance and audit purposes. 
          Approved users gain full access to platform features.
        </div>
      </div>
    </div>
  );
}

// Helper Component
function DocumentPreview({ label, url }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div 
        className="aspect-video bg-black/70 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all"
        onClick={() => url && window.open(url, '_blank')}
      >
        {url ? (
          <img 
            src={url} 
            alt={label} 
            className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-all" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            No document
          </div>
        )}
      </div>
    </div>
  );
}
