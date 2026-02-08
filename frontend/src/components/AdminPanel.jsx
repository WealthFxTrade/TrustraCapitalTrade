import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Wallet } from 'lucide-react';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleTransaction = async (userId, transactionId, action) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/transactions/${userId}/${transactionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchUsers(); // Refresh data
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-indigo-400 font-mono">SYNCHRONIZING TRUSTRA NODES...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            TRUSTRA COMMAND CENTER
          </h1>
          <div className="px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
            v2.0.26-PROD
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {users.map(user => {
            const pendingTxs = user.ledger?.filter(tx => tx.status === 'pending') || [];
            
            return (
              <div key={user._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* User Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex gap-3 mt-4">
                      <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-xs font-bold border border-indigo-500/20">
                        {user.plan?.toUpperCase() || 'NO PLAN'}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-xs font-bold border border-emerald-500/20">
                        €{user.balances?.EUR?.toLocaleString() || '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Pending Transactions Section */}
                  <div className="flex-1 max-w-md">
                    {pendingTxs.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14}/> Pending Authorization
                        </p>
                        {pendingTxs.map(tx => (
                          <div key={tx._id} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold capitalize">{tx.type}</p>
                              <p className="text-[10px] text-gray-400">€{Math.abs(tx.amount)} • {tx.currency}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTransaction(user._id, tx._id, 'approve')}
                                className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => handleTransaction(user._id, tx._id, 'reject')}
                                className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 italic">No pending actions</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

