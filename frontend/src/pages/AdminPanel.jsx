import React, { useEffect, useState } from 'react';
import { adminStats, adminUsers, adminApproveKyc } from '../api';

export default function AdminPanel() {
  const [data, setData] = useState({ stats: {}, users: [] });

  const fetchAdminData = async () => {
    try {
      const [s, u] = await Promise.all([adminStats(), adminUsers()]);
      setData({ stats: s.data, users: u.data });
    } catch (err) { console.error("Admin Access Denied"); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Production Admin Console</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <p className="text-gray-400">Total Volume</p>
          <h3 className="text-xl font-bold">${data.stats.totalDeposits || 0}</h3>
        </div>
      </div>

      <div className="bg-slate-900 rounded border border-slate-800">
        <table className="w-full text-left">
          <thead className="border-b border-slate-800">
            <tr><th className="p-3">User</th><th>KYC Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data.users.map(user => (
              <tr key={user._id} className="border-b border-slate-800">
                <td className="p-3">{user.email}</td>
                <td><span className="text-yellow-500">{user.kycStatus}</span></td>
                <td>
                  <button 
                    onClick={() => adminApproveKyc(user._id).then(fetchAdminData)}
                    className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-500"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

