import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Safe referral link generation (only if user exists)
  const referralLink = user?._id || user?.username
    ? `\( {window.location.origin}/register?ref= \){user._id || user.username}`
    : '';

  const handleCopy = () => {
    if (!referralLink) {
      return toast.error('No referral link available');
    }

    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6 md:p-12 space-y-10">
      {/* Warning Banner – very important for referral pages */}
      <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 flex items-start gap-4 max-w-4xl mx-auto">
        <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={28} />
        <div>
          <h4 className="font-bold text-red-300 mb-2">Important Warning</h4>
          <p className="text-red-200 text-sm leading-relaxed">
            Referral programs can resemble pyramid schemes and carry significant risk. Earnings are not guaranteed. Never pay money to join or promote a referral program. If anyone asks for fees or promises high returns from referrals, it may be fraudulent. Report suspicious activity.
          </p>
        </div>
      </div>

      <header className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-indigo-500">
          <Users size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Network Sharing</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Refer a Friend
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
          Share your unique link with others. This is an optional feature with no guaranteed benefits.
        </p>
      </header>

      {/* Referral Link Section */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl" />

        <div className="space-y-6 text-center">
          <h3 className="text-xl font-black uppercase tracking-tight">
            Your Personal Referral Link
          </h3>

          {referralLink ? (
            <>
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-sm text-indigo-400 break-all relative group">
                {referralLink}
                <button
                  onClick={handleCopy}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all active:scale-90"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Share this link to invite others to the platform. No rewards or commissions are guaranteed.
              </p>
            </>
          ) : (
            <p className="text-red-400 text-sm">
              You must be logged in with a valid account to generate a referral link.
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex gap-4">
          <Info className="text-indigo-400 shrink-0" size={20} />
          <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
            Referral links are for informational sharing only. Do not promise earnings or bonuses. Misrepresentation may violate platform terms or local laws.
          </p>
        </div>

        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex gap-4">
          <AlertTriangle className="text-amber-400 shrink-0" size={20} />
          <p className="text-[9px] text-amber-300 leading-relaxed uppercase tracking-widest font-bold">
            Beware of scams: Anyone promising referral commissions or requiring payment to join is likely fraudulent.
          </p>
        </div>
      </div>
    </div>
  );
}
