import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '../constants/api';

export default function InvestConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { planId, name, amount } = location.state || {};

  // Redirect if no data (safety check)
  useEffect(() => {
    if (!planId || !amount) {
      navigate('/plans', { replace: true });
    }
  }, [planId, amount, navigate]);

  if (!planId || !amount) return null;

  const handleConfirm = async () => {
    if (!confirm(`Confirm investment of €\( {Number(amount).toLocaleString()} in \){name || 'selected plan'}?\n\nThis is subject to market risk and cannot be reversed.`)) {
      return;
    }

    setLoading(true);

    try {
      // Use centralized endpoint
      const endpoint = API_ENDPOINTS.INVESTMENTS || '/invest/activate';
      await api.post(endpoint, {
        planId,
        amount: Number(amount),
        timestamp: new Date().toISOString(),
      });

      toast.success('Investment confirmed');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm investment';
      toast.error(msg);

      // Smart redirect on balance error
      if (msg.toLowerCase().includes('balance') || msg.toLowerCase().includes('insufficient')) {
        navigate('/deposit');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-sans">
      <div className="bg-[#0f1218] p-10 rounded-[2.5rem] border border-white/5 max-w-md w-full space-y-8 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition"
        >
          <ArrowLeft size={14} /> Back to Plans
        </button>

        {/* Strong Risk Warning */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-3xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-red-300 mb-2">High Risk Notice</h4>
            <p className="text-red-200 text-sm leading-relaxed">
              Cryptocurrency investments carry significant risk of loss. Returns are not guaranteed and can be negative. Only invest what you can afford to lose. Confirm only if you fully understand the risks.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
            Investment Confirmation
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Review details before proceeding
          </p>
        </div>

        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">Plan</span>
            <span className="text-indigo-400">{name || planId}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">Amount</span>
            <span className="text-white">€{Number(amount).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="group w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <ShieldCheck
            size={18}
            className={loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}
          />
          {loading ? 'Processing...' : 'Confirm Investment'}
        </button>
      </div>
    </div>
  );
}
