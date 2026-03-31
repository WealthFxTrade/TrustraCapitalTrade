import React, { useState, useEffect, useCallback } from 'react';
import api from '../../constants/api'; // Standardized API import
import {
  Settings, ShieldCheck, Percent, Zap, Lock, Loader2, Save,
  RefreshCcw, AlertOctagon, TrendingUp, Coins, Globe, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    minWithdrawal: 50,
    dailyRoi: 0.5,
    btcInterest: 1.2,
    ethInterest: 1.5,
    maintenanceMode: false,
    referralBonus: 10
  });

  /** ── 🛰️ FETCH SYSTEM CONFIG ── */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/settings');
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Settings sync failed');
      toast.error('System Configuration Unreachable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /** ── ⚖️ UPDATE SYSTEM CONFIG ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', config);
      if (data.success) {
        toast.success('Global Protocol Synchronized', {
          style: { background: '#065f46', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });
      }
    } catch (err) {
      toast.error('Sync Rejection: Unauthorized');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020408] text-emerald-500 font-mono">
      <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
      <p className="text-[10px] tracking-[0.5em] uppercase">Decrypting Core Config...</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-16 space-y-12 bg-[#020408] min-h-screen text-white font-sans selection:bg-emerald-500/20">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={14} /> Back to Command
          </button>
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Settings size={20} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Protocol Config</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            System <span className="text-emerald-500">Parameters</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* WITHDRAWAL & ROI SETTINGS */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[3rem] p-10 backdrop-blur-md relative overflow-hidden">
          <TrendingUp className="absolute right-[-20px] top-[-20px] opacity-5 scale-150" size={120} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3">
            <Zap size={16} className="text-emerald-500" /> Liquidity Thresholds
          </h3>
          <div className="space-y-8">
            <SettingInput
              label="Min. Withdrawal (EUR)"
              icon={<Zap size={14}/>}
              value={config.minWithdrawal}
              onChange={(val) => setConfig({...config, minWithdrawal: val})}
            />
            <SettingInput
              label="Default Daily ROI (%)"
              icon={<Percent size={14}/>}
              value={config.dailyRoi}
              onChange={(val) => setConfig({...config, dailyRoi: val})}
            />
          </div>
        </div>

        {/* CRYPTO INTEREST SETTINGS */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[3rem] p-10 backdrop-blur-md relative overflow-hidden">
          <Coins className="absolute right-[-20px] top-[-20px] opacity-5 scale-150" size={120} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3">
            <Globe size={16} className="text-emerald-500" /> Staking Yields
          </h3>
          <div className="space-y-8">
            <SettingInput
              label="BTC Annual Yield (%)"
              icon={<ShieldCheck size={14}/>}
              value={config.btcInterest}
              onChange={(val) => setConfig({...config, btcInterest: val})}
            />
            <SettingInput
              label="ETH Annual Yield (%)"
              icon={<ShieldCheck size={14}/>}
              value={config.ethInterest}
              onChange={(val) => setConfig({...config, ethInterest: val})}
            />
          </div>
        </div>

        {/* SECURITY & MAINTENANCE */}
        <div className="md:col-span-2 bg-rose-500/5 border border-rose-500/10 rounded-[3rem] p-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-start gap-6">
            <div className={`p-5 rounded-2xl transition-colors ${config.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-white/5 text-gray-500'}`}>
              <Lock size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Maintenance Lockdown</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 max-w-xl leading-relaxed">
                Emergency protocol. Enabling this will freeze all <span className="text-rose-500">Withdrawals</span>, <span className="text-rose-500">Deposits</span>, and <span className="text-rose-500">Terminal Access</span> for all user nodes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to take the platform ${config.maintenanceMode ? 'ONLINE' : 'OFFLINE'}?`)) {
                setConfig({...config, maintenanceMode: !config.maintenanceMode});
              }
            }}
            className={`px-12 py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all whitespace-nowrap ${
              config.maintenanceMode 
                ? 'bg-rose-600 text-white shadow-2xl shadow-rose-600/30 ring-4 ring-rose-600/20' 
                : 'bg-white/5 text-white/40 border border-white/10 hover:border-emerald-500/50 hover:text-emerald-500'
            }`}
          >
            {config.maintenanceMode ? 'TERMINAL LOCKED' : 'TERMINAL ACTIVE'}
          </button>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="md:col-span-2 w-full bg-emerald-600 text-black py-7 rounded-[2rem] font-black text-[11px] tracking-[0.6em] uppercase hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Transmitting Data...' : 'Commit Global Protocol Changes'}
        </button>
      </form>
    </div>
  );
}

/** ── SETTING INPUT HELPER ── */
function SettingInput({ label, icon, value, onChange }) {
  return (
    <div className="space-y-4 group">
      <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
        {icon} {label}
      </label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/60 border border-white/5 p-6 rounded-2xl font-mono text-xl text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner uppercase tracking-tighter" 
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <RefreshCcw size={16} />
        </div>
      </div>
    </div>
  );
}
