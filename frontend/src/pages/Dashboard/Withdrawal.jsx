// src/pages/Dashboard/Withdrawal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, History, ArrowUpRight, ShieldCheck,
  Loader2, LogOut, AlertTriangle, Wallet, CreditCard, ArrowDownLeft, Info, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function SidebarLink({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full text-left group ${
        active
          ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-600/20'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={active ? 'text-black' : 'group-hover:text-emerald-500'} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function Withdrawal() {
  const { user, logout, initialized, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [balances, setBalances] = useState({ ROI: 0, EUR: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDT',
    walletType: 'ROI',
    address: '',
    network: 'TRC-20'
  });

  const fetchBalances = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.USER.BALANCES);
      if (res.data?.success) {
        const b = res.data.balances || {};
        setBalances({
          ROI: Number(b.ROI || 0),
          EUR: Number(b.EUR || 0)
        });
      }
    } catch (err) {
      toast.error('Failed to synchronize local ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) navigate('/login');
      else fetchBalances();
    }
  }, [initialized, isAuthenticated, navigate, fetchBalances]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    const available = formData.walletType === 'ROI' ? balances.ROI : balances.EUR;

    if (amount < 50) return toast.error('Minimum withdrawal is €50.00');
    if (amount > available) return toast.error('Insufficient liquidity in selected node');
    if (!formData.address) return toast.error('Destination address/IBAN required');

    setSubmitting(true);
    const toastId = toast.loading("Executing Security Audit...");
    
    try {
      // PROD ROUTE: Matches router.post('/withdraw', requestWithdrawal)
      const res = await api.post('/user/withdraw', formData);
      if (res.data?.success) {
        toast.success('Withdrawal queued for audit', { id: toastId });
        setTimeout(() => navigate('/dashboard/ledger'), 2000);
      }
    } catch (err) {
      toast.error(err.message || 'Liquidation Request Failed', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 bg-[#0a0c10] border-r border-white/5 p-8 flex-col h-screen">
        <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
          <ShieldCheck className="text-emerald-500" size={32} />
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Trustra</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Portfolio" onClick={() => navigate('/dashboard')} />
          <SidebarLink icon={ArrowDownLeft} label="Deposit" onClick={() => navigate('/dashboard/deposit')} />
          <SidebarLink icon={ArrowUpRight} label="Withdraw" active onClick={() => navigate('/dashboard/withdrawal')} />
          <SidebarLink icon={History} label="Audit Ledger" onClick={() => navigate('/dashboard/ledger')} />
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-400 transition-all border-t border-white/5 pt-8">
          <LogOut size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-6 lg:p-12 space-y-12">
        <header>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">Asset Liquidation</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: Node Liquidity Sufficient</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            
            {/* Wallet Selection */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'ROI', label: 'Accrued ROI', val: balances.ROI },
                { id: 'EUR', label: 'Principal AUM', val: balances.EUR }
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setFormData(p => ({ ...p, walletType: w.id }))}
                  className={`p-8 rounded-[2.5rem] border text-left transition-all ${
                    formData.walletType === w.id ? 'bg-emerald-600 border-emerald-500 text-black' : 'bg-[#0a0c10] border-white/5'
                  }`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${formData.walletType === w.id ? 'text-black/60' : 'text-gray-500'}`}>{w.label}</p>
                  <p className="text-3xl font-black italic tracking-tighter">€{w.val.toLocaleString('de-DE')}</p>
                </button>
              ))}
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Liquidation Amount (EUR)</label>
                  <div className="relative">
                    <input 
                      type="number" value={formData.amount} required
                      onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                      placeholder="Min €50.00"
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xl font-black focus:border-emerald-500 outline-none transition-all text-white pr-20"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-600">EUR</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Settlement Asset</label>
                    <select 
                      value={formData.asset}
                      onChange={(e) => setFormData(p => ({ ...p, asset: e.target.value }))}
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none"
                    >
                      <option value="USDT">USDT (Stable)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="SEPA">SEPA (Bank)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Network Protocol</label>
                    <select 
                      value={formData.network}
                      onChange={(e) => setFormData(p => ({ ...p, network: e.target.value }))}
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none"
                    >
                      <option value="TRC-20">TRC-20 (Instant)</option>
                      <option value="ERC-20">ERC-20 (Secure)</option>
                      <option value="BTC">Mainnet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Destination Address / IBAN</label>
                  <div className="relative">
                    <input 
                      type="text" value={formData.address} required
                      onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                      placeholder="0x... or IBAN for Bank"
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs font-mono focus:border-emerald-500 outline-none transition-all text-white"
                    />
                    <Wallet className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={submitting}
                className="w-full bg-white text-black py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'Auditing Transaction...' : 'Initiate Liquidation'}
              </button>
            </form>
          </div>

          {/* Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white italic">
                <CheckCircle2 size={16} className="text-emerald-500" /> Audit Standards
              </h4>
              <ul className="space-y-4">
                {[
                  "Withdrawals undergo a 12-hour custodial audit.",
                  "Funds are released upon three network confirmations.",
                  "Daily liquidation limit: €50,000 per node.",
                  "Institutional accounts bypass standard queue."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    <span className="text-emerald-500">•</span> {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2.5rem] flex gap-4">
              <AlertTriangle className="text-rose-500 shrink-0" size={24} />
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Protocol Warning</h5>
                <p className="text-[9px] text-rose-500/60 leading-relaxed uppercase font-black tracking-tighter">
                  Incorrect network selection (e.g. sending ERC-20 to TRC-20) will result in irreversible asset loss. Double-audit your destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

