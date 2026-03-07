import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Edit3, ShieldCheck, 
  TrendingUp, Wallet, X, RefreshCw, AlertTriangle 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/**
 * AdminUsers - Full investor registry with manual balance override
 * Real-time refresh & modal override for EUR/ROI vaults
 */
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [overrideData, setOverrideData] = useState({
    amount: '',
    type: 'add',        // 'add' or 'subtract'
    balanceType: 'EUR', // 'EUR' or 'ROI'
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all users from backend
  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/admin/users', { timeout: 10000 });
      // Support both { data: [] } and raw array responses
      setUsers(data.data || data || []);
    } catch (err) {
      console.error('Failed to load investor registry:', err);
      toast.error(err.response?.data?.message || 'Failed to sync registry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter((user) =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleOverride = async (e) => {
    e.preventDefault();
    if (!overrideData.amount || isNaN(overrideData.amount)) {
      return toast.error('Enter a valid numerical amount');
    }

    const toastId = toast.loading('Synchronizing Ledger Override...');
    try {
      await api.put(`/admin/users/${selectedUser._id}/balance`, overrideData);
      toast.success('Node Ledger synchronized successfully', { id: toastId });
      setSelectedUser(null);
      setOverrideData({ amount: '', type: 'add', balanceType: 'EUR' });
      fetchUsers(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Override failed', { id: toastId });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020408]">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-lg font-medium text-gray-400 font-mono tracking-widest uppercase">Accessing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10 bg-[#020408] min-h-screen text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Investor <span className="text-yellow-500">Registry</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-[0.2em] font-medium">
            Node Identity & Asset Management • Zurich Mainnet
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Filter by Node ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-yellow-500/50 outline-none transition-all placeholder-gray-600"
            />
          </div>
          <button onClick={fetchUsers} disabled={refreshing} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="p-6">Investor Node</th>
                <th className="p-6">Capital (EUR)</th>
                <th className="p-6">Yields (ROI)</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-mono">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-white uppercase italic">{user.username || '—'}</div>
                    <div className="text-[10px] text-gray-600 mt-1">{user.email}</div>
                  </td>
                  <td className="p-6 text-emerald-500 font-bold">
                    €{(user.balances?.EUR || 0).toLocaleString()}
                  </td>
                  <td className="p-6 text-yellow-500 font-bold">
                    €{(user.balances?.ROI || 0).toLocaleString()}
                  </td>
                  <td className="p-6">
                    <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-black uppercase border border-white/10">
                      {user.activePlan || 'OFFLINE'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg transition-all border border-yellow-500/20"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleOverride} className="bg-[#0A0C10] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Override: {selectedUser.username}</h2>
              <button type="button" onClick={() => setSelectedUser(null)}><X className="text-gray-500" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setOverrideData({...overrideData, type: 'add'})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${overrideData.type === 'add' ? 'bg-green-600 border-green-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>Deposit</button>
                <button type="button" onClick={() => setOverrideData({...overrideData, type: 'subtract'})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${overrideData.type === 'subtract' ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>Withdraw</button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setOverrideData({...overrideData, balanceType: 'EUR'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${overrideData.balanceType === 'EUR' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 bg-white/5 text-gray-500'}`}>EUR Vault</button>
                <button type="button" onClick={() => setOverrideData({...overrideData, balanceType: 'ROI'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${overrideData.balanceType === 'ROI' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/10 bg-white/5 text-gray-500'}`}>ROI Vault</button>
              </div>

              <input 
                type="number" step="0.01" required min="0.01" placeholder="0.00"
                className="w-full bg-[#020408] border border-white/10 rounded-xl py-5 text-center text-2xl font-bold outline-none focus:border-yellow-500"
                value={overrideData.amount} onChange={(e) => setOverrideData({...overrideData, amount: e.target.value})}
              />
            </div>

            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all">
              Commit Ledger Change
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
