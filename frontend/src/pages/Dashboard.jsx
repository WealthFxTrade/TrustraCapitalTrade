import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserAccount, getBtcPrice, getUserInvestments } from '../api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboard() {
      try {
        // Fetch user account & investments in parallel
        const [userRes, invRes] = await Promise.all([
          getUserAccount(),
          getUserInvestments(),
        ]);

        if (!mounted) return;

        setAccount(userRes.data);
        setInvestments(invRes.data || []);

        // BTC price is optional; do not block dashboard
        try {
          const btcRes = await getBtcPrice();
          if (mounted) {
            setBtcPrice(
              btcRes.data?.price ?? btcRes.data?.btcPrice ?? btcRes.data?.priceUsd ?? null
            );
          }
        } catch {
          setBtcPrice(null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-bold text-cyan-400">Dashboard</h1>
        <button
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Account Info */}
      <section className="mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-4">Account Information</h2>
        <p><strong>Name:</strong> {account?.fullName || account?.name}</p>
        <p><strong>Email:</strong> {account?.email}</p>
        <p><strong>Role:</strong> {account?.role}</p>
      </section>

      {/* BTC Price */}
      <section className="mb-12 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-4">Live Bitcoin Price</h2>
        {btcPrice ? (
          <p className="text-4xl font-bold text-yellow-400">
            ${Number(btcPrice).toLocaleString()}
          </p>
        ) : (
          <p className="text-gray-400">BTC price temporarily unavailable</p>
        )}
      </section>

      {/* Investments */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Your Investments</h2>
        {investments.length === 0 ? (
          <p className="text-gray-400">You have no active investments.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((inv) => (
              <div
                key={inv._id}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700"
              >
                <p><strong>Plan:</strong> {inv.planName}</p>
                <p><strong>Amount:</strong> ${Number(inv.amount).toLocaleString()}</p>
                <p><strong>Daily ROI:</strong> {inv.roiDaily}%</p>
                <p><strong>Duration:</strong> {inv.duration} days</p>
                <p><strong>Status:</strong> {inv.status}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
