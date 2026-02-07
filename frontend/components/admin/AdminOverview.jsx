import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Users, Activity, Loader2 } from 'lucide-react';
import api from '../../api/apiService';
import toast from 'react-hot-toast';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        toast.error('Global Ledger sync failed');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-gray-500 italic">
      <Loader2 className="animate-spin" size={18} />
      Synchronizing Platform Metrics...
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Platform Liquidity (Total EUR) */}
      <div className="bg-[#0f121d] border border-gray-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[2px]">Secured</span>
        </div>
        <div className="mt-6 relative z-10">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Platform Liquidity</h3>
          <p className="text-2xl font-bold text-white mt-1">
            €{stats.totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Active Investment Volume */}
      <div className="bg-[#0f121d] border border-gray-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
          <div className="p-4 bg-green-500/10 rounded-2xl text-green-400 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[2px]">Growth</span>
        </div>
        <div className="mt-6 relative z-10">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active Assets</h3>
          <p className="text-2xl font-bold text-white mt-1">
            €{stats.activeInvestmentVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Total Investor Count */}
      <div className="bg-[#0f121d] border border-gray-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[2px]">Verified</span>
        </div>
        <div className="mt-6 relative z-10">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Global Investors</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Running Trading Plans */}
      <div className="bg-[#0f121d] border border-gray-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[2px]">Active</span>
        </div>
        <div className="mt-6 relative z-10">
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Running Plans</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.usersWithActivePlans}</p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}

