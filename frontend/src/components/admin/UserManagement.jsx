import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  ShieldCheck, Search, MoreVertical, 
  TrendingUp, Wallet, UserMinus, Edit3, 
  Loader2, CheckCircle2, XCircle, AlertTriangle, X, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── SUB-COMPONENT: EDIT MODAL ─── */
const UserEditModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    kycStatus: user.kycStatus || 'pending',
    role: user.role || 'user',
    eurBalance: user.balances?.EUR || 0,
    btcBalance: user.balances?.BTC || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/users/${user._id}`, formData);
      toast.success("Investor Node Protocol Updated");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-md">
      <div className="bg-[#0a0f1e] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-rose-500/5">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Modify Entity</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2 tracking-widest">EUR Liquidity</label>
              <input 
                type="number"
                value={formData.eurBalance}
                onChange={(e) => setFormData({...formData, eurBalance: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-500 ml-2 tracking-widest">BTC Liquidity</label>
              <input 
                type="number"
                step="any"
                value={formData.btcBalance}
                onChange={(e) => setFormData({...formData, btcBalance: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-500 ml-2 tracking-widest">Compliance Status</label>
            <select 
              value={formData.kycStatus}
              onChange={(e) => setFormData({...formData, kycStatus: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase text-white outline-none focus:border-rose-500/50 appearance-none"
            >
              <option value="pending" className="bg-[#0a0f1e]">Pending Review</option>
              <option value="verified" className="bg-[#0a0f1e]">Verified / Compliant</option>
              <option value="rejected" className="bg-[#0a0f1e]">Rejected / Terminated</option>
            </select>
          </div>

          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-3 items-center">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <p className="text-[9px] text-gray-500 uppercase font-bold italic leading-relaxed">
              Modifications are logged to the Audit Protocol. Manual balance overrides bypass the automated node yields.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <ShieldCheck size={16}/>}
            Commit Protocol Changes
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT: USER MANAGEMENT ─── */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error("Access Denied: Administrative Clearance Required");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-rose-500" /> Network <span className="text-rose-500">Control</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">v8.4.2 Global Investor Oversight</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            placeholder="Search Entity / UID / Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-rose-500/50 transition-all"
          />
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase text-rose-500 mb-2 tracking-widest">Global Nodes</p>
          <p className="text-4xl font-black italic">{users.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Active ROI Yields</p>
          <p className="text-4xl font-black italic text-emerald-500">{users.filter(u => u.activePlan !== 'None').length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Total EUR Liquidity</p>
          <p className="text-3xl font-black italic">
            €{users.reduce((acc, curr) => acc + (curr.balances?.EUR || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Decrypting Master Registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-8 py-6">Investor Entity</th>
                  <th className="px-8 py-6">Liquidity (EUR/BTC)</th>
                  <th className="px-8 py-6">Node Status</th>
                  <th className="px-8 py-6">Compliance</th>
                  <th className="px-8 py-6 text-right">Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-xs font-black text-rose-500 uppercase">
                          {u.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-white">{u.fullName || 'Authorized User'}</p>
                          <p className="text-[10px] text-gray-600 font-mono tracking-tighter mt-0.5 uppercase">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white italic">€{u.balances?.EUR?.toLocaleString() || '0.00'}</span>
                      </div>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 tracking-tighter">BTC: {u.balances?.BTC?.toFixed(6) || '0.000000'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        u.activePlan !== 'None' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {u.activePlan || 'Idle Node'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {u.kycStatus === 'verified' ? (
                          <CheckCircle2 className="text-emerald-500" size={14} />
                        ) : (
                          <XCircle className="text-yellow-500" size={14} />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {u.kycStatus === 'verified' ? 'Compliant' : 'Awaiting Audit'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="text-rose-500 font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl border border-rose-500/20 transition-all italic"
                      >
                        Adjust Node
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      {selectedUser && (
        <UserEditModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdate={fetchAllUsers} 
        />
      )}
    </div>
  );
}
