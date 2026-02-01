import { useEffect, useState } from 'react';
import { getReferralData } from '../api';

export default function Referrals() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getReferralData().then(r => setData(r.data));
  }, []);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Referral Program</h1>

      <p>Your referral code:</p>
      <p className="text-xl font-bold text-cyan-400">{data.code}</p>

      <p className="mt-4">Total Referrals: {data.total}</p>
      <p>Earnings: ${data.earnings}</p>
    </div>
  );
}
