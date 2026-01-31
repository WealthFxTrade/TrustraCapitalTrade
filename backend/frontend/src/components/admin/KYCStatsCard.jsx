// src/components/admin/KYCStatsCard.jsx
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function KYCStatsCard({ token }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKYCStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/kyc/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load KYC stats');

      setStats(data.stats || stats);
    } catch (err) {
      setError(err.message);
      console.error('KYC stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchKYCStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchKYCStats, 60000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
        <span className="text-gray-300">Loading KYC stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  const pendingPercentage = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-5 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Clock className="h-6 w-6 text-yellow-500" />
          KYC Overview
        </h3>
        <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
        {/* Total */}
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-400">{stats.total}</p>
          <p className="text-sm text-gray-400 mt-1">Total Submissions</p>
        </div>

        {/* Pending */}
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-gray-400 mt-1">Pending</p>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${pendingPercentage}%` }}
            />
          </div>
        </div>

        {/* Approved */}
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
          <p className="text-sm text-gray-400 mt-1">Approved</p>
        </div>

        {/* Rejected */}
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-sm text-gray-400 mt-1">Rejected</p>
        </div>
      </div>

      {/* Quick actions / status bar */}
      <div className="px-5 py-4 border-t border-gray-700 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {stats.pending > 0 ? (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-400">{stats.pending} awaiting review</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400">All KYC up to date</span>
            </>
          )}
        </div>

        <button
          onClick={fetchKYCStats}
          className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
