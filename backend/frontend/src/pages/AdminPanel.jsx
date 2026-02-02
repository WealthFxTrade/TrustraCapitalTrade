// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import { adminStats, adminUsers, adminApproveKyc } from '../api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [data, setData] = useState({ stats: {}, users: [] });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // Fetch stats & users
  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      const [s, u] = await Promise.all([adminStats(), adminUsers()]);
      setData({ stats: s.data, users: u.data });
    } catch (err) {
      console.error('Admin access error:', err);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filter users with pending KYC
  const pendingUsers = data.users.filter((u) => u.kycStatus !== 'approved');

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Production Admin Console</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded border border-slate-800">
          <p className="text-gray-400">Total Deposits</p>
          <h3 className="text-xl font-bold">${data.stats.totalDeposits || 0}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded border border-slate-800">
          <p className="text-gray-400">Total Users</p>
          <h3 className="text-xl font-bold">{data.users.length}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded border border-slate-800">
          <p className="text-gray-400">Pending KYC</p>
          <h3 className="text-xl font-bold">{pendingUsers.length}</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded border border-slate-800 overflow-x-auto">
        {loadingUsers ? (
          <p className="p-4 text-center text-gray-400">Loading users...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="p-4 text-center text-green-400">No pending KYC requests</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th>KYC Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id} className="border-b border-slate-800">
                  <td className="p-3">{user.email}</td>
                  <td>
                    <span className="text-yellow-500">{user.kycStatus}</span>
                  </td>
                  <td>
                    <button
                      disabled={approvingId === user._id}
                      onClick={async () => {
                        try {
                          setApprovingId(user._id);
                          await adminApproveKyc(user._id);
                          toast.success(`KYC approved for ${user.email}`);
                          fetchAdminData();
                        } catch (err) {
                          console.error(err);
                          toast.error(`Failed to approve KYC for ${user.email}`);
                        } finally {
                          setApprovingId(null);
                        }
                      }}
                      className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-500 disabled:opacity-50"
                    >
                      {approvingId === user._id ? 'Approving...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
