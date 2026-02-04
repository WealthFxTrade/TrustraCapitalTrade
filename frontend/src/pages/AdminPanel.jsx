import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Users, Wallet, Clock, CheckCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminStats, adminUsers, adminApproveKyc } from '../api';

export default function AdminPanel() {
  const [data, setData] = useState({ stats: {}, users: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async (signal) => {
    try {
      setError(null);
      setRefreshing(true);
      const [statsRes, usersRes] = await Promise.all([
        adminStats(signal),
        adminUsers(signal),
      ]);

      setData({
        stats: statsRes?.data || {},
        users: usersRes?.data || [],
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Admin data fetch failed:', err);
      setError('Failed to load admin data. Please try again.');
      toast.error('Connection error or unauthorized access');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdminData(controller.signal);

    return () => controller.abort();
  }, [fetchAdminData]);

  const pendingUsers = data.users.filter((u) => u.kycStatus !== 'approved');

  const handleApproveKyc = async (userId, email) => {
    const optimisticUsers = data.users.map((u) =>
      u._id === userId ? { ...u, kycStatus: 'approved' } : u
    );

    // Optimistic UI update
    setData((prev) => ({ ...prev, users: optimisticUsers }));

    setApprovingId(userId);
    try {
      await adminApproveKyc(userId);
      toast.success(`KYC approved for ${email}`);
      // Refetch to confirm server state
      await fetchAdminData(new AbortController().signal);
    } catch (err) {
      toast.error('KYC approval failed');
      // Rollback on error
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u._id === userId ? { ...u, kycStatus: 'pending' } : u
        ),
      }));
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Management Console</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" /> Secure Admin Access
            </p>
          </div>

          <button
            onClick={() => fetchAdminData(new AbortController().signal)}
            disabled={refreshing}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCcw className={`h-6 w-6 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 px-6 py-4 rounded-2xl mb-8 text-center">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <Wallet className="h-16 w-16 text-emerald-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Deposits</p>
            <h3 className="text-3xl md:text-4xl font-bold font-mono text-emerald-400">
              ${(data.stats.totalDeposits || 0).toLocaleString()}
            </h3>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <Users className="h-16 w-16 text-indigo-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Investor Count</p>
            <h3 className="text-3xl md:text-4xl font-bold font-mono">{data.users.length}</h3>
          </div>

          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <Clock className="h-16 w-16 text-amber-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Pending KYC</p>
            <h3 className="text-3xl md:text-4xl font-bold font-mono text-amber-400">
              {pendingUsers.length}
            </h3>
          </div>
        </div>

        {/* Pending KYC Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h4 className="font-bold text-lg">Verification Requests</h4>
            <span className="px-4 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wide">
              Action Required
            </span>
          </div>

          <div className="overflow-x-auto">
            {refreshing ? (
              <div className="p-16 text-center text-slate-500 animate-pulse font-medium">
                Syncing secure records...
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12 text-emerald-500 opacity-30" />
                <p className="text-slate-400 font-medium">No pending KYC requests at this time.</p>
              </div>
            ) : (
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-5">Investor Email</th>
                    <th className="px-6 py-5">Current Status</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-5 font-medium text-sm">{user.email}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full uppercase">
                          {user.kycStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          disabled={approvingId === user._id}
                          onClick={() => handleApproveKyc(user._id, user.email)}
                          className="bg-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-900/30"
                        >
                          {approvingId === user._id ? 'Verifying...' : 'Approve KYC'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p className="text-center mt-12 text-xs text-slate-700 font-bold uppercase tracking-widest">
          © 2016–2026 Trustra Capital Trade Management Console
        </p>
      </div>
    </div>
  );
}
