import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Copy, Check, AlertTriangle, Info, Share2, ShieldAlert 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Corrected string interpolation for the link
  const referralLink = user?._id || user?.username
    ? `${window.location.origin}/register?ref=${user._id || user.username}`
    : '';

  const handleCopy = () => {
    if (!referralLink) return toast.error('No referral link available');
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Protocol Link Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 space-y-12 font-sans">
      
      {/* ⚠️ RISK PROTOCOL BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6"
      >
        <div className="bg-red-500/10 p-4 rounded-2xl">
          <ShieldAlert className="text-red-500" size={32} />
        </div>
        <div>
          <h4 className="font-black uppercase italic text-red-500 tracking-tighter mb-1">Risk Disclosure & Warning</h4>
          <p className="text-[10px] uppercase font-bold text-red-200/60 leading-relaxed tracking-widest">
            Referral participation is optional and carries inherent risks. Potential earnings are speculative and not guaranteed. 
            Avoid any entity requesting fees for referral access or promising fixed returns. Misconduct results in immediate node termination.
          </p>
        </div>
      </motion.div>

      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-yellow-500">
          <Share2 size={16} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Expansion Module</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
          Network <span className="text-yellow-500">Growth</span>
        </h1>
      </header>

      {/* REFERRAL LINK INTERFACE */}
      <div className="max-w-3xl mx-auto relative group">
        <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] rounded-full opacity-50" />
        <div className="relative bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 md:p-16 backdrop-blur-3xl shadow-2xl">
          <div className="space-y-8 text-center">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Your Unique Expansion Hash</h3>
            
            {referralLink ? (
              <div className="flex flex-col gap-6">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-8 font-mono text-sm text-yellow-500/80 break-all relative group overflow-hidden">
                  {referralLink}
                  <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
                </div>
                
                <button
                  onClick={handleCopy}
                  className="w-full md:w-max mx-auto px-12 py-5 bg-white text-black hover:bg-yellow-500 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 active:scale-95"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Hash Secured' : 'Copy Invitation Link'}
                </button>
              </div>
            ) : (
              <div className="p-8 border border-white/5 rounded-2xl bg-white/5 text-red-400 font-black uppercase text-[10px] tracking-widest">
                System Offline: Please authenticate to generate hash.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPLIANCE FOOTER */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex items-start gap-4">
          <Info className="text-yellow-500 shrink-0" size={18} />
          <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
            All referral activity is monitored by the Rio Compliance Engine. Fraudulent invitation patterns will lead to fund freezing.
          </p>
        </div>
        <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex items-start gap-4">
          <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
          <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
            Never misrepresent the platform's ROI. High-yield claims must include clear risk disclosure.
          </p>
        </div>
      </div>
    </div>
  );
}
