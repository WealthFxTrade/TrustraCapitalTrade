import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function InvestConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { planId, name, amount, roiDaily, duration } = location.state || {};

  // ✅ Proper redirect handling
  useEffect(() => {
    if (!planId || !amount) {
      navigate('/plans', { replace: true });
    }
  }, [planId, amount, navigate]);

  if (!planId || !amount) return null;

  const handleActivation = async () => {
    try {
      setLoading(true);

      await api.post('/invest/activate', {
        planId,
        amount,
        timestamp: new Date().toISOString()
      });

      toast.success(`${name} Schema Activated!`);

      navigate('/dashboard', { replace: true });

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Insufficient funds or Node busy';

      toast.error(msg);

      if (msg.toLowerCase().includes('balance')) {
        navigate('/deposit');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-sans">
      <div className="bg-[#0f1218] p-10 rounded-[2.5rem] border border-white/5 max-w-md w-full space-y-8 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50" />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition"
        >
          <ArrowLeft size={14} /> Back to Plans
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
            Review Deployment
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Protocol V8.4.1 Setup
          </p>
        </div>

        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">Selected Schema</span>
            <span className="text-indigo-400">{name || planId}</span>
          </div>

          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">Principal Stake</span>
            <span className="text-white">€{amount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs font-bold uppercase tracking-widest border-t border-white/5 pt-4">
            <span className="text-gray-500">Daily Forecast</span>
            <span className="text-emerald-500">+{roiDaily}%</span>
          </div>

          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">Lock Term</span>
            <span className="text-white">{duration} Days</span>
          </div>
        </div>

        <div className="flex gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-[9px] leading-relaxed text-amber-200 font-bold uppercase">
            Funds will be locked in the {name} node for {duration} days.
            Early termination may trigger 2026 Asset Security penalties.
          </p>
        </div>

        <button
          onClick={handleActivation}
          disabled={loading}
          className="group w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2"
        >
          <ShieldCheck
            size={18}
            className={
              loading
                ? 'animate-spin'
                : 'group-hover:scale-110 transition-transform'
            }
          />
          {loading ? 'Decrypting Node...' : 'Authorize Activation'}
        </button>
      </div>
    </div>
  );
}
