import { useEffect, useState } from 'react';
import { adminStats, adminKyc, adminApproveKyc } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [kyc, setKyc] = useState([]);

  useEffect(() => {
    adminStats().then(r => setStats(r.data));
    adminKyc().then(r => setKyc(r.data));
  }, []);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

      <p>Total Users: {stats.users}</p>
      <p>Total Deposits: ${stats.deposits}</p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Pending KYC</h2>

      {kyc.map(k => (
        <div key={k._id} className="bg-slate-800 p-4 mb-3 rounded">
          <p>{k.user.email}</p>
          <button
            onClick={() => adminApproveKyc(k._id)}
            className="mt-2 bg-green-500 px-4 py-2 rounded text-black"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
