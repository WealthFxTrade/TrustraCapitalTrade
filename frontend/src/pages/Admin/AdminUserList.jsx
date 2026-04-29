import React, { useState, useEffect } from 'react';
import { Search, User, Loader2, RefreshCcw, ArrowRight } from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminUserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error('Failed to load user database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">User Directory</h1>
          <p className="text-gray-500">Manage liquidity and account standing</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" placeholder="Search..."
            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-8 py-5">User</th>
              <th className="px-6 py-5">Available</th>
              <th className="px-6 py-5">Invested</th>
              <th className="px-6 py-5">ROI</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.02]">
                <td className="px-8 py-6">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                </td>
                <td className="px-6 py-6 font-mono text-sm text-white">€{u.availableBalance?.toLocaleString()}</td>
                <td className="px-6 py-6 font-mono text-sm text-gray-400">€{u.principal?.toLocaleString()}</td>
                <td className="px-6 py-6 font-mono text-sm text-emerald-400">€{u.accruedROI?.toLocaleString()}</td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => navigate(`/admin/users/${u._id}`)}
                    className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"
                  >
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

