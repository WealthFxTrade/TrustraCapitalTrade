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
  MoreVertical,
  ArrowUpDown
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
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [overrideData, setOverrideData] = useState({
    amount: '',
    type: 'add',        // 'add' or 'subtract'
    balanceType: 'EUR', // 'EUR' or 'ROI'
  });

  /** ── 🛰️ FETCH INVESTOR REGISTRY ── */
  const fetchUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      // Targets router.get('/admin/users') in your backend
      const { data } = await api.get('/admin/users', { timeout: 10000 });
      setUsers(data.data || data || []);
    } catch (err) {
      console.error('Failed to load investor registry:', err);
      toast.error(err.response?.data?.message || 'Failed to sync registry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000); // Auto-sync every 60s
    return () => clearInterval(interval);
  }, [fetchUsers]);

  /** ── 🔍 SEARCH FILTERING ── */
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter((user) =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term) ||
      user._id?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  /** ── ⚖️ LEDGER OVERRIDE HANDLER ── */
  const handleOverride = async (e) => {
    e.preventDefault();
    if (!overrideData.amount || isNaN(overrideData.amount)) {
      return toast.error('Enter a valid numerical amount');
    }

    setIsUpdating(true);
    const toastId = toast.loading('Synchronizing Ledger Override...');
    
    try {
      // Targets router.put('/admin/users/:id/balance')
      await api.put(`/admin/users/${selectedUser._id}/balance`, overrideData);
      
      toast.success('Node Ledger synchronized successfully', { id: toastId });
      setSelectedUser(null);
      setOverrideData({ amount: '', type: 'add', balanceType: 'EUR' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Override failed', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020408]">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-lg font-black text-gray-400 font-mono tracking-[0.4em] uppercase">Accessing Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans selection:bg-yellow-500/20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
            INVESTOR <span className="text-yellow-500">REGISTRY</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black italic">
            Global Node Management • Manual Liquidity Control
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 focus-within:border-yellow-500/50 transition-all flex-1 md:flex-none md:w-64 shadow-2xl">
            <Search size={14} className="text-gray-600" />
            <input 
              type="text" 
              placeholder="Filter Node / Email..." 
              className="bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/10 disabled:opacity-50 group shadow-lg"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            {refreshing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
      </div>

      {/* ── INVESTOR TABLE ── */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
            <Users size={14} /> Active Nodes: {filteredUsers.length}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-yellow-500 italic">
            <ShieldCheck size={14} className="animate-pulse" /> ADMIN CLEARANCE GRANTED
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6">Investor Node</th>
                <th className="px-8 py-6">Main Wallet (EUR)</th>
                <th className="px-8 py-6">Yield Wallet (ROI)</th>
                <th className="px-8 py-6">KYC Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-yellow-500 border border-white/10 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase italic tracking-tighter leading-none mb-1">{user.username}</p>
                        <p className="text-[9px] text-gray-600 font-bold lowercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs font-black text-white">
                    €{(user.balances?.EUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 font-mono text-xs font-black text-yellow-500/80">
                    €{(user.balances?.ROI || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[8px] font-black px-3 py-1 rounded border tracking-widest uppercase ${
                      user.kycStatus === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-white/10 text-white/20'
                    }`}>
                      {user.kycStatus || 'NONE'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-3 bg-white/5 rounded-xl text-gray-500 hover:bg-yellow-500 hover:text-black transition-all shadow-lg border border-white/5"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">No Node Clusters Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── OVERRIDE MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0A0C10] border border-white/10 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl border-t-yellow-500/50 border-t-2">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <header className="mb-8 text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-black shadow-xl shadow-yellow-500/10">
                <TrendingUp size={32} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Node <span className="text-yellow-500">Override</span></h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 italic tracking-widest">Protocol Sync: {selectedUser.username}</p>
            </header>

            <form onSubmit={handleOverride} className="space-y-6">
              {/* VAULT TARGETING */}
              <div className="grid grid-cols-2 gap-4">
                {['EUR', 'ROI'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOverrideData({...overrideData, balanceType: type})}
                    className={`py-4 rounded-2xl border font-black text-[10px] tracking-widest uppercase transition-all ${
                      overrideData.balanceType === type 
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' 
                        : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {type} Vault
                  </button>
                ))}
              </div>

              {/* OP TYPE */}
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setOverrideData({...overrideData, type: 'add'})}
                  className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${overrideData.type === 'add' ? 'bg-green-500/20 text-green-500' : 'text-gray-600'}`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideData({...overrideData, type: 'subtract'})}
                  className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${overrideData.type === 'subtract' ? 'bg-red-500/20 text-red-500' : 'text-gray-600'}`}
                >
                  Deduct
                </button>
              </div>

              {/* AMOUNT */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Adjustment Magnitude</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any"
                    value={overrideData.amount}
                    onChange={(e) => setOverrideData({...overrideData, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-black border border-white/5 p-5 rounded-2xl font-mono text-xl text-yellow-500 outline-none focus:border-yellow-500/30 transition-all placeholder:text-gray-800"
                    required
                  />
                  <Wallet size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10" />
                </div>
              </div>

              {/* WARNING BOX */}
              <div className="bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl flex items-start gap-4">
                <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-1" />
                <p className="text-[8px] font-black uppercase leading-relaxed text-yellow-500/60 tracking-tighter italic">
                  Critical: Manual overrides bypass node security. Verify target balance type and amount before authorizing protocol synchronization.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase hover:bg-yellow-500 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : 'Authorize Protocol Sync'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

