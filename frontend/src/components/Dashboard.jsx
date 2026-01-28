import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function Dashboard({ token, user: initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [kycFiles, setKycFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to load user');
        const userData = await userRes.json();
        setUser(userData.user);

        const txRes = await fetch(`${BACKEND_URL}/api/user/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const txData = await txRes.json();
        setTransactions(txData);
      } catch (err) {
        setMessage(err.message);
      }
    };

    fetchData();
  }, [token]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deposit failed');

      setUser(data.user);
      setMessage('Deposit successful!');
      setDepositAmount('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed');

      setUser(data.user);
      setMessage('Withdrawal successful!');
      setWithdrawAmount('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documents: kycFiles }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'KYC submission failed');

      setMessage('KYC documents submitted – awaiting verification');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-400">
            Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition"
          >
            Logout
          </button>
        </header>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/30">
            <h3 className="text-xl text-gray-400 mb-2">Balance</h3>
            <p className="text-5xl font-bold text-green-400">
              ${user?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/30">
            <h3 className="text-xl text-gray-400 mb-2">Active Plan</h3>
            <p className="text-4xl font-bold text-indigo-400">
              {user?.plan || 'None'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/30">
            <h3 className="text-xl text-gray-400 mb-2">KYC Status</h3>
            <p
              className="text-3xl font-bold"
              style={{
                color:
                  user?.kycStatus === 'verified'
                    ? '#22c55e'
                    : user?.kycStatus === 'pending'
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {user?.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
            </p>
          </div>
        </div>

        {/* Deposit & Withdraw */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 rounded-2xl p-8 border border-green-600/30">
            <h3 className="text-2xl font-bold mb-6 text-green-400">Deposit</h3>
            <form onSubmit={handleDeposit}>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount in USD"
                className="w-full p-4 mb-4 bg-gray-900 border border-gray-700 rounded-lg text-white text-xl"
                min="10"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Deposit Now'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 border border-red-600/30">
            <h3 className="text-2xl font-bold mb-6 text-red-400">Withdraw</h3>
            <form onSubmit={handleWithdraw}>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount in USD"
                className="w-full p-4 mb-4 bg-gray-900 border border-gray-700 rounded-lg text-white text-xl"
                min="10"
                max={user?.balance || 0}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Withdraw Now'}
              </button>
            </form>
          </div>
        </div>

        {/* KYC */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12 border border-indigo-600/30">
          <h3 className="text-2xl font-bold mb-6 text-indigo-400">
            KYC Verification
          </h3>

          {user?.kycStatus !== 'verified' && (
            <form onSubmit={handleKycSubmit}>
              <input
                type="text"
                placeholder="Paste document URLs (comma separated)"
                className="w-full p-4 mb-4 bg-gray-900 border border-gray-700 rounded-lg text-white"
                onChange={(e) =>
                  setKycFiles(e.target.value.split(','))
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit KYC Documents'}
              </button>
            </form>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/30">
          <h3 className="text-2xl font-bold mb-6 text-indigo-400">
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <p className="text-gray-400">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 capitalize">{tx.type}</td>
                      <td
                        className="py-3 px-4 font-bold"
                        style={{
                          color:
                            tx.type === 'deposit' || tx.type === 'profit'
                              ? '#22c55e'
                              : '#ef4444',
                        }}
                      >
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 capitalize">{tx.status}</td>
                      <td className="py-3 px-4">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-8 py-4 rounded-xl border border-indigo-600 shadow-2xl">
          {message}
        </div>
      )}
    </div>
  );
}
