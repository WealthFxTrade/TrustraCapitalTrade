// src/pages/Admin/AdminUsers.jsx - FULL USER MANAGEMENT WITH ADVANCED FEATURES
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Edit3,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Eye,
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
    type: 'add',
    balanceType: 'EUR',
  });

  // Fetch all users
  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users || data.data || data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search filter
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter(user =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Balance override
  const handleOverride = async (e) => {
    e.preventDefault();
    if (!selectedUser || !overrideData.amount || isNaN(overrideData.amount)) {
      return toast.error('Please enter a valid amount');
    }

    setIsUpdating(true);
    const toastId = toast.loading('Updating balance...');

    try {
      await api.put(`/api/admin/users/${selectedUser._id}/balance`, overrideData);
      toast.success('Balance updated successfully', { id: toastId });
      setSelectedUser(null);
      setOverrideData({ amount: '', type: 'add', balanceType: 'EUR' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete user (with confirmation)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            USER <span className="text-yellow-500">MANAGEMENT</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em]">Full control over all registered nodes</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:border-yellow-500 outline-none"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            REGISTERED USERS • {filteredUsers.length} TOTAL
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/[0.02]">
                <th className="px-8 py-6">USER</th>
                <th className="px-8 py-6">EMAIL</th>
                <th className="px-8 py-6 text-right">EUR BALANCE</th>
                <th className="px-8 py-6 text-right">ROI</th>
                <th className="px-8 py-6 text-center">KYC</th>
                <th className="px-8 py-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-yellow-500" size={40} /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-400 font-black border border-white/10">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-400">{user.email}</td>
                    <td className="px-8 py-6 text-right font-mono text-emerald-400">
                      €{(user.totalBalance || user.balances?.EUR || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-yellow-400">
                      €{(user.balances?.ROI || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-4 py-1 text-xs rounded-full border ${
                        user.kycStatus === 'verified' ? 'border-emerald-500 text-emerald-400' : 'border-gray-500 text-gray-400'
                      }`}>
                        {user.kycStatus?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl transition-all"
                        title="Edit Balance"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Override Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="bg-[#0A0C10] border border-yellow-500/30 w-full max-w-md rounded-[2.5rem] p-10 relative">
            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
              <X size={28} />
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp size={32} className="text-black" />
              </div>
              <h2 className="text-2xl font-black">Balance Override</h2>
              <p className="text-yellow-400 mt-1">{selectedUser.username}</p>
            </div>

            <form onSubmit={handleOverride} className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Balance Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['EUR', 'ROI'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOverrideData({ ...overrideData, balanceType: type })}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                        overrideData.balanceType === type ? 'bg-yellow-500 text-black' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Action</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOverrideData({ ...overrideData, type: 'add' })}
                    className={`flex-1 py-4 rounded-2xl font-black ${overrideData.type === 'add' ? 'bg-emerald-500 text-black' : 'bg-white/5'}`}
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideData({ ...overrideData, type: 'subtract' })}
                    className={`flex-1 py-4 rounded-2xl font-black ${overrideData.type === 'subtract' ? 'bg-red-500 text-black' : 'bg-white/5'}`}
                  >
                    SUBTRACT
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={overrideData.amount}
                  onChange={(e) => setOverrideData({ ...overrideData, amount: e.target.value })}
                  className="w-full bg-black border border-white/10 p-5 rounded-2xl text-3xl font-mono text-yellow-400 focus:border-yellow-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 disabled:opacity-50"
              >
                {isUpdating ? 'PROCESSING...' : 'APPLY OVERRIDE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
