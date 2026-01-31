// src/components/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, DollarSign, TrendingUp, ArrowRight, CreditCard } from 'lucide-react';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function Dashboard({ token, user, setUser, logout }) {
  const [balance, setBalance] = useState(null);
  const [plan, setPlan] = useState(null);
  const [dailyRate, setDailyRate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setBalance(data.user.balance);
        setPlan(data.user.plan);
        setDailyRate(data.dailyRate);

        const txRes = await fetch(`${BACKEND_URL}/api/user/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-xl animate-pulse flex items-center gap-3">
          <TrendingUp className="h-6 w-6 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-8">{error}</p>
          <button
            onClick={handleLogout}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
          >
            Logout & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold">TrustraCapital</span>
            </span>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-400">Welcome,</span>
                <span className="font-medium">{user?.fullName || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance & Plan */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-gray-900 border border-indigo-800/50 rounded-2xl p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-gray-400 mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-green-400">
              ${balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-1">Active Plan</p>
            <p className="text-xl font-semibold text-indigo-400">{plan || 'None'}</p>
            {dailyRate > 0 && (
              <p className="text-sm text-green-400 mt-1">
                Daily Rate: {(dailyRate * 100).toFixed(2)}%
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link
            to="/plan-selection"
            state={{ token, setUser }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-900/20 flex flex-col items-start gap-3"
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-500" /> Change Plan
            </h3>
            <p className="text-gray-400 text-sm">Upgrade or switch investment strategy</p>
          </Link>

          <Link
            to="/deposit"
            state={{ token, setUser }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-900/20 flex flex-col items-start gap-3"
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-green-500" /> Deposit Funds
            </h3>
            <p className="text-gray-400 text-sm">Add funds to your account</p>
          </Link>

          <Link
            to="/withdraw"
            state={{ token, setUser }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-900/20 flex flex-col items-start gap-3"
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-500" /> Withdraw
            </h3>
            <p className="text-gray-400 text-sm">Request withdrawal</p>
          </Link>
        </div>

        {/* Recent Transactions */}
        <section className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 text-sm">
                    <th className="pb-4 pr-6">Type</th>
                    <th className="pb-4 pr-6">Amount</th>
                    <th className="pb-4 pr-6">Date</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx, i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="py-4 pr-6">{tx.type}</td>
                      <td className="py-4 pr-6">
                        <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'completed' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
