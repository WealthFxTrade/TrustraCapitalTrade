import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, X } from 'lucide-react';
import api from '../../api/apiService';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const viewLedger = (user) => setSelectedUser(user);

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold italic">Investor Relations</h1>
          <p className="text-gray-500 text-sm tracking-tight">Audit and verify all financial ledger entries.</p>
        </div>
        <button onClick={fetchUsers} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500 h-10 w-10" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f121d] border border-gray-800 rounded-2xl shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#05070a] text-gray-500 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-5">Investor Name / Email</th>
                <th className="px-6 py-5">Main Wallet</th>
                <th className="px-6 py-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-5">
                    <div className="font-bold uppercase tracking-tight">{user.fullName || user.username || user.name}</div>
                    <div className="text-[10px] text-gray-600 font-mono">{user.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-indigo-400 font-bold text-base">
                      {/* FIX: Changed USD to EUR to match migration */}
                      €{(user.balances?.EUR || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => viewLedger(user)}
                      className="bg-gray-800 hover:bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase transition shadow-lg"
                    >
                      Inspect Ledger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEDGER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#0f121d] border border-gray-800 rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#05070a]/50">
              <div>
                <h2 className="text-xl font-bold italic text-indigo-400">Financial Audit</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                  Target: {selectedUser.fullName || selectedUser.username}
                </p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600/20 transition">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#05070a] text-gray-500 text-[9px] uppercase tracking-[3px] font-black">
                  <tr>
                    <th className="px-8 py-4">Transaction Type / Date</th>
                    <th className="px-8 py-4">Value (€)</th>
                    <th className="px-8 py-4 text-right">Confirmation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {selectedUser.ledger && selectedUser.ledger.length > 0 ? (
                    [...selectedUser.ledger] // Create copy before sorting
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-white/[0.01]">
                          <td className="px-8 py-6">
                            <div className="text-[11px] font-black uppercase text-gray-300 tracking-tighter">
                              {transaction.type}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-1 font-mono">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={`font-mono font-bold text-sm ${
                                transaction.type === 'roi_profit' ? 'text-green-400' : 'text-white'
                              }`}
                            >
                              €{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span
                              className={`text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest border ${
                                transaction.status === 'completed'
                                  ? 'border-green-500/20 bg-green-500/5 text-green-500'
                                  : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500'
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-20 text-center text-gray-600 italic font-medium">
                        No financial activity recorded in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

