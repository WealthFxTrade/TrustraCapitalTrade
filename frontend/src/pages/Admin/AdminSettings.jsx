import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Settings, 
  ShieldCheck, 
  Percent, 
  Zap, 
  Lock, 
  Loader2, 
  Save, 
  RefreshCcw,
  AlertOctagon,
  TrendingUp,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
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
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/settings');
      if (data.success) setConfig(data.config);
    } catch (err) {
      console.error('Settings sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /** ── ⚖️ UPDATE SYSTEM CONFIG ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings/update', config);
      if (data.success) {
        toast.success('Global Protocol Updated');
      }
    } catch (err) {
      toast.error('Sync Rejection: Unauthorized');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#020408]">
      <RefreshCcw className="w-10 h-10 text-yellow-500 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans selection:bg-yellow-500/20">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4 text-yellow-500">
            <Settings size={20} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Protocol Configuration</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Financial <span className="text-yellow-500">Terminal</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* WITHDRAWAL & ROI SETTINGS */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
            <TrendingUp size={16} /> Liquidity Rules
          </h3>
          
          <div className="space-y-6">
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
        <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-md">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
            <Coins size={16} /> Asset Staking
          </h3>
          
          <div className="space-y-6">
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
        <div className="md:col-span-2 bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-yellow-500 rounded-2xl text-black">
              <Lock size={32} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Maintenance Protocol</h4>
              <p className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest mt-1 max-w-md leading-relaxed">
                Activating this node will suspend all user-side terminal operations and liquidity outbound requests immediately.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
            className={`px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
              config.maintenanceMode ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            {config.maintenanceMode ? 'System Offline' : 'System Live'}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="md:col-span-2 w-full bg-white text-black py-6 rounded-2xl font-black text-xs tracking-[0.5em] uppercase hover:bg-yellow-500 transition-all shadow-2xl flex items-center justify-center gap-3"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Transmitting Data...' : 'Commit Protocol Changes'}
        </button>
      </form>
    </div>
  );
}

/** ── SETTING INPUT HELPER ── */
function SettingInput({ label, icon, value, onChange }) {
  return (
    <div className="space-y-3 group">
      <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2 flex items-center gap-2 group-hover:text-yellow-500 transition-colors">
        {icon} {label}
      </label>
      <input 
        type="number" 
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl font-mono text-xl text-white outline-none focus:border-yellow-500/50 transition-all shadow-inner"
      />
    </div>
  );
}

