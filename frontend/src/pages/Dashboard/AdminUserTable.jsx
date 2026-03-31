import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  RefreshCw,
  Euro,
  TrendingUp,
  UserCog,
  ShieldCheck,
  Mail,
  Fingerprint
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

export default function AdminUserTable() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ── FETCH USER DIRECTORY ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.ADMIN.USERS);
      setUsers(data.users || data.data || []);
    } catch (err) {
      toast.error("Directory Sync Failed: Access Protocol Error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── QUICK KYC TOGGLE ──
  const handleToggleKYC = async (userId, currentStatus) => {
    setUpdatingId(userId);
    const targetStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    try {
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/kyc`, { status: targetStatus });
      toast.success(`Node Identity: ${targetStatus.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      toast.error("Identity update rejected by server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.fullName || u.name)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-end px-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Identity <span className="text-emerald-500 underline underline-offset-8 decoration-emerald-500/20">Registry</span>
          </h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2 italic">
            Active Terminal Nodes: {users.length} • Zurich Protocol v8.4
          </p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search Fingerprint / Email / Identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] focus:border-emerald-500/40 outline-none transition-all uppercase tracking-widest font-black placeholder:text-gray-800"
            />
          </div>
          <button 
            onClick={fetchUsers} 
            disabled={loading}
            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── MAIN LEDGER TABLE ── */}
      <div className="bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                <th className="px-10 py-8">Investor Profile</th>
                <th className="px-10 py-8">Identity Status</th>
                <th className="px-10 py-8">Principal (EUR)</th>
                <th className="px-10 py-8">Yield (ROI)</th>
                <th className="px-10 py-8 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-emerald-500" size={40} />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/40 italic">Decrypting Directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-40 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-800 italic">No Nodes Found in Search Range</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                        <Fingerprint size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-tight leading-none mb-1">{u.fullName || u.name}</p>
                        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold lowercase">
                          <Mail size={10} className="text-emerald-500/40" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-10 py-8">
                    <button 
                      onClick={() => handleToggleKYC(u._id, u.kycStatus)}
                      disabled={updatingId === u._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                        u.kycStatus === 'verified' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                      }`}
                    >
                      {updatingId === u._id ? <RefreshCw size={10} className="animate-spin" /> : 
                       u.kycStatus === 'verified' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                      {u.kycStatus || 'Unverified'}
                    </button>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-white font-mono text-sm font-black italic">
                      <Euro size={14} className="text-emerald-500/50" />
                      {Number(u.balance || u.balances?.EUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-emerald-500 font-mono text-sm font-black italic">
                      <TrendingUp size={14} className="opacity-40" />
                      {Number(u.roiBalance || u.balances?.ROI || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-emerald-500 hover:text-black transition-all group/btn shadow-xl" title="Modify Node Balances">
                        <PlusCircle size={18} className="text-emerald-500 group-hover/btn:text-black" />
                      </button>
                      <button className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-600" title="Full Profile Audit">
                        <UserCog size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ── SECURITY FOOTER ── */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex items-center justify-between mx-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Security Command Center</p>
            <p className="text-xs text-gray-500 font-medium">Administrative edits are logged and encrypted with RSA-4096. Use with caution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
