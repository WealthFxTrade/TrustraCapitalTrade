import React, { useEffect, useState } from 'react';
import { adminStats, adminUsers, adminApproveKyc } from '../api';
import { ShieldCheck, Users, Wallet, Clock, CheckCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [data, setData] = useState({ stats: {}, users: [] });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      const [s, u] = await Promise.all([adminStats(), adminUsers()]);
      setData({ stats: s.data, users: u.data });
    } catch (err) {
      console.error('Admin access error:', err);
      toast.error('Unauthorized or connection error');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const pendingUsers = data.users.filter((u) => u.kycStatus !== 'approved');

  return (
    <div className="p-4 md:p-10 bg-slate-950 min-h-screen text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Management Console</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-indigo-500" /> Secure Admin Access
            </p>
          </div>
          <button 
            onClick={fetchAdminData} 
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            <RefreshCcw className={`h-5 w-5 text-slate-400 ${loadingUsers ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="h-12 w-12" /></div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Deposits</p>
            <h3 className="text-3xl font-bold font-mono text-emerald-400">
              ${(data.stats.totalDeposits || 0).toLocaleString()}
            </h3>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="h-12 w-12" /></div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Investor Count</p>
            <h3 className="text-3xl font-bold font-mono">{data.users.length}</h3>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="h-12 w-12" /></div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Pending KYC</p>
            <h3 className="text-3xl font-bold font-mono text-amber-400">{pendingUsers.length}</h3>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h4 className="font-bold">Verification Requests</h4>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full uppercase">Action Required</span>
          </div>

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="p-20 text-center text-slate-500 animate-pulse font-medium">Syncing with secure vault...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <CheckCircle className="h-10 w-10 text-emerald-500 opacity-20" />
                <p className="text-slate-500 font-medium">No pending KYC requests found.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Investor Email</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/20 transition group">
                      <td className="px-6 py-4 font-medium text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded uppercase">
                          {user.kycStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={approvingId === user._id}
                          onClick={async () => {
                            try {
                              setApprovingId(user._id);
                              await adminApproveKyc(user._id);
                              toast.success(`KYC Verified: ${user.email}`);
                              fetchAdminData();
                            } catch (err) {
                              toast.error(`Verification Failed`);
                            } finally {
                              setApprovingId(null);
                            }
                          }}
                          className="bg-indigo-600 px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
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
      </div>
      
      <p className="text-center mt-12 text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
        © 2016–2026 Trustra Capital Trade Management Console
      </p>
    </div>
  );
}

