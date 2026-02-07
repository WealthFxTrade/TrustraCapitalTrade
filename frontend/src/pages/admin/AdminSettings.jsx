import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Key, Percent, Globe, Loader2, RefreshCw } from 'lucide-react';
import api from '../../api/apiService';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    xpub: '',
    maintenanceMode: false,
    referralPercent: 5,
    minWithdrawal: 10,
    siteName: 'TrustraCapitalTrade'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success) setSettings(res.data.settings);
      } catch (err) {
        toast.error("Failed to fetch Trustra Global Config");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/update', settings);
      toast.success("Trustra Nodes Synchronized Successfully");
    } catch (err) {
      toast.error("Update Failed: Check Backend Logs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold italic">Global Settings</h1>
          <p className="text-gray-500 text-sm">Configure TrustraCapitalTrade core parameters and financial logic.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* BITCOIN NODE CONFIG */}
          <div className="bg-[#0f121d] border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Key size={20} /></div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Crypto Infrastructure</h3>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">Bitcoin XPUB (Extended Public Key)</label>
              <textarea 
                value={settings.xpub}
                onChange={(e) => setSettings({...settings, xpub: e.target.value})}
                className="w-full bg-[#05070a] border border-gray-800 rounded-2xl p-4 font-mono text-xs text-indigo-400 focus:border-indigo-500 outline-none h-24"
                placeholder="xpub6CuGV..."
              />
              <p className="text-[10px] text-gray-600 italic">Used for unique Bech32 address derivation for every investor.</p>
            </div>
          </div>

          {/* FINANCIAL PARAMETERS */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0f121d] border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Percent size={20} /></div>
                <h3 className="font-bold uppercase tracking-widest text-sm">Revenue Logic</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Referral Bonus (%)</label>
                  <input 
                    type="number" 
                    value={settings.referralPercent}
                    onChange={(e) => setSettings({...settings, referralPercent: e.target.value})}
                    className="w-full bg-[#05070a] border border-gray-800 rounded-xl p-3 font-bold focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Min Withdrawal (€)</label>
                  <input 
                    type="number" 
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings({...settings, minWithdrawal: e.target.value})}
                    className="w-full bg-[#05070a] border border-gray-800 rounded-xl p-3 font-bold focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SYSTEM STATUS */}
            <div className="bg-[#0f121d] border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ShieldAlert size={20} /></div>
                <h3 className="font-bold uppercase tracking-widest text-sm">Security & Branding</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-gray-800">
                   <div>
                      <p className="text-xs font-bold">Maintenance Mode</p>
                      <p className="text-[9px] text-gray-600 uppercase">Lock frontend access</p>
                   </div>
                   <input 
                    type="checkbox" 
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="w-6 h-6 rounded-full accent-red-600"
                   />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Platform Name</label>
                  <input 
                    type="text" 
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full bg-[#05070a] border border-gray-800 rounded-xl p-3 font-bold focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black uppercase tracking-[3px] text-xs shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Commit Global Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

