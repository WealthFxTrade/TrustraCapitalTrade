// src/pages/Admin/AdminUsers.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Edit3,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [overrideData, setOverrideData] = useState({
    amount: '',
    type: 'add',        // 'add' or 'subtract'
    balanceType: 'EUR', // 'EUR' or 'ROI'
  });

  /** Fetch all users from backend */
  const fetchUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users || data.data || data || []);
    } catch (err) {
      console.error('[ADMIN USERS ERROR]', err);
      toast.error(err.response?.data?.message || 'Failed to load investor registry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, [fetchUsers]);

  /** Filtered users based on search */
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter((user) =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  /** Handle manual balance override */
  const handleOverride = async (e) => {
    e.preventDefault();
    if (!selectedUser || !overrideData.amount || isNaN(overrideData.amount)) {
      return toast.error('Please enter a valid amount');
    }

    setIsUpdating(true);
    const toastId = toast.loading('Applying ledger override...');

    try {
      await api.put(`/api/admin/users/${selectedUser._id}/balance`, overrideData);

      toast.success('Balance override applied successfully', { id: toastId });
      setSelectedUser(null);
      setOverrideData({ amount: '', type: 'add', balanceType: 'EUR' });
      fetchUsers(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Override failed', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020408]">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-400 font-black uppercase tracking-[0.4em]">Loading Investor Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            INVESTOR <span className="text-yellow-500">REGISTRY</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">
            Global Node Management • Manual Liquidity Control
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:border-yellow-500/50 outline-none"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'SYNCING...' : 'FORCE SYNC'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Users size={16} /> ACTIVE NODES: {filteredUsers.length}
          </h3>
          <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
            <ShieldCheck size={16} className="animate-pulse" /> ADMIN OVERRIDE ENABLED
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-left">INVESTOR NODE</th>
                <th className="px-8 py-6 text-right">EUR BALANCE</th>
                <th className="px-8 py-6 text-right">ROI BALANCE</th>
                <th className="px-8 py-6 text-center">KYC</th>
                <th className="px-8 py-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-400 font-black border border-white/10 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-emerald-400">
                      €{(user.balances?.EUR || user.totalBalance || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-yellow-400">
                      €{(user.balances?.ROI || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-4 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${
                        user.kycStatus === 'verified' 
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                          : 'border-gray-500 text-gray-400'
                      }`}>
                        {user.kycStatus?.toUpperCase() || 'UNSUBMITTED'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all border border-white/10"
                      >
                        <Edit3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    No matching nodes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="bg-[#0A0C10] border border-yellow-500/30 w-full max-w-md rounded-[2.5rem] p-10 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <X size={28} />
            </button>

            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={32} className="text-black" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Manual Override
              </h2>
              <p className="text-yellow-400 mt-2">{selectedUser.username}</p>
            </div>

            <form onSubmit={handleOverride} className="space-y-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Balance Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['EUR', 'ROI'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOverrideData({ ...overrideData, balanceType: type })}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                        overrideData.balanceType === type
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {type} Vault
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Operation</label>
                <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setOverrideData({ ...overrideData, type: 'add' })}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${overrideData.type === 'add' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideData({ ...overrideData, type: 'subtract' })}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${overrideData.type === 'subtract' ? 'bg-rose-500 text-black' : 'text-gray-400'}`}
                  >
                    SUBTRACT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={overrideData.amount}
                  onChange={(e) => setOverrideData({ ...overrideData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-3xl font-mono text-yellow-400 focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-2xl text-xs text-yellow-400">
                <AlertTriangle size={18} className="inline mr-2" />
                This action bypasses normal node validation. Use with extreme caution.
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'AUTHORIZE OVERRIDE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
