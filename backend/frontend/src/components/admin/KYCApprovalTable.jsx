// src/components/admin/KYCApprovalTable.jsx
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Eye, AlertCircle, X } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function KYCApprovalTable({ token }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingKYC = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load pending KYC');

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
      console.error('KYC fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPendingKYC();

    const interval = setInterval(fetchPendingKYC, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this KYC submission?')) return;

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/kyc/ \){id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');

      alert('KYC approved successfully');
      fetchPendingKYC();
    } catch (err) {
      alert('Error approving KYC: ' + err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await fetch(`\( {BACKEND_URL}/api/admin/kyc/ \){selectedSubmission._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');

      alert('KYC rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchPendingKYC();
    } catch (err) {
      alert('Error rejecting KYC: ' + err.message);
    }
  };

  const openImages = (submission) => {
    setSelectedSubmission(submission);
    setShowImageViewer(true);
  };

  const openReject = (submission) => {
    setSelectedSubmission(submission);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
      <span className="text-gray-300">Loading pending KYC submissions...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
      <p className="text-red-300">{error}</p>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-xl font-bold">Pending KYC Approvals</h3>
        <p className="text-sm text-gray-400 mt-1">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No pending KYC submissions at this time
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-700 text-left text-sm text-gray-400">
                <th className="p-4">User</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((kyc) => (
                <tr key={kyc._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-medium">
                    {kyc.user?.fullName || kyc.user?.email || 'Unknown'}
                  </td>
                  <td className="p-4 capitalize">{kyc.documentType?.replace('_', ' ') || '—'}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(kyc.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right flex gap-3 justify-end pr-8">
                    <button
                      onClick={() => openImages(kyc)}
                      className="p-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 transition"
                      title="View documents"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleApprove(kyc._id)}
                      className="px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => openReject(kyc)}
                      className="px-4 py-1.5 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-medium transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && selectedKyc && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImageViewer(false)}
        >
          <div 
            className="relative bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-gray-800/80 rounded-full p-2 z-10"
            >
              <X size={28} />
            </button>

            <div className="p-8 space-y-10">
              <h3 className="text-2xl font-bold text-center mb-8">KYC Documents Review</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <p className="text-center font-semibold text-gray-300">Front / Main Document</p>
                  <img
                    src={selectedKyc.frontImage}
                    alt="Front document"
                    className="w-full rounded-xl border border-gray-700 shadow-2xl object-contain max-h-[50vh]"
                    onError={e => e.target.src = 'https://via.placeholder.com/600x400?text=Front+Not+Found'}
                  />
                </div>

                {selectedKyc.backImage && (
                  <div className="space-y-3">
                    <p className="text-center font-semibold text-gray-300">Back Side</p>
                    <img
                      src={selectedKyc.backImage}
                      alt="Back document"
                      className="w-full rounded-xl border border-gray-700 shadow-2xl object-contain max-h-[50vh]"
                      onError={e => e.target.src = 'https://via.placeholder.com/600x400?text=Back+Not+Found'}
                    />
                  </div>
                )}

                <div className="space-y-3 md:col-span-2 lg:col-span-1">
                  <p className="text-center font-semibold text-gray-300">Selfie / Liveness Proof</p>
                  <img
                    src={selectedKyc.selfieImage}
                    alt="Selfie"
                    className="w-full max-w-md mx-auto rounded-xl border border-gray-700 shadow-2xl object-contain max-h-[50vh]"
                    onError={e => e.target.src = 'https://via.placeholder.com/400x400?text=Selfie+Not+Found'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-red-400">Reject KYC Submission</h3>

            <label className="block text-gray-300 mb-3 font-medium">
              Rejection reason (required – user will see this):
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Blurry image • Mismatched face • Expired document • Poor quality selfie..."
              className="w-full h-32 p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-6"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  rejectionReason.trim()
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-900/60 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
