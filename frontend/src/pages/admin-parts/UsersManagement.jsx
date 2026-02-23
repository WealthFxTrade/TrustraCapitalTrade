import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users, Ban, CheckCircle, Search, Loader2, ShieldAlert } from 'lucide-react';
import api from '../../api'; // Your axios instance

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: 20, search },
      });
      // ALIGNED: Matching your backend res.json({ users, pages })
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to access secure user ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Elevate user to ${newRole} status?`)) return;
    try {
      // NOTE: Ensure your backend admin.js has a PATCH route for this
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Security clearance updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update clearance level');
    }
  };

  const handleBanToggle = async (userId, banned) => {
    const action = banned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/ban`, { banned: !banned });
      toast.success(banned ? 'User restored' : 'User access revoked');
      fetchUsers();
    } catch (err) {
      toast.error('Ban status update failed');
    }
  };

  return (
    <div className="p-4 md:p-10 bg-slate-950 min-h-screen text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-4">
              <Users size={40} className="text-indigo-500" /> Super Admin <span className="text-indigo-400">Vault</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Manage global investor access</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-2xl">
            <ShieldAlert size={16} className="text-indigo-500" />
            <span className="text-[10px] font-bold uppercase text-indigo-200">Level 4 Access Required</span>
          </div>
        </header>

        {/* High-Contrast Search */}
        <div className="mb-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by UID, email, or phone number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-[1.5rem] py-4 pl-14 pr-6 focus:border-indigo-500 outline-none transition-all shadow-xl shadow-black/20"
          />
        </div>

        {/* 2026 Grid-based Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Decrypting User Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-slate-800">Investor Info</th>
                  <th className="px-6 py-5 border-b border-slate-800">Contact</th>
                  <th className="px-6 py-5 border-b border-slate-800">Security Role</th>
                  <th className="px-6 py-5 border-b border-slate-800">Account Status</th>
                  <th className="px-6 py-5 border-b border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-100">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">UID: {user._id?.slice(-12)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-600">{user.phone || 'No phone set'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-400 outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                        <option value="superadmin">SUPER ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.banned ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`text-[10px] font-black uppercase ${user.banned ? 'text-red-500' : 'text-emerald-500'}`}>
                          {user.banned ? 'Revoked' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleBanToggle(user._id, user.banned)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 ${
                          user.banned
                            ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white'
                            : 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        {user.banned ? 'Restore' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Console */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
              Previous
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

