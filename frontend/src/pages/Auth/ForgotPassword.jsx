import React, { useState } from 'react';
import { Mail, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadToast = toast.loading("Verifying Identity...");

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message, { id: loadToast });
      // Redirect to reset page and pass the email in state
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Failure", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <ShieldCheck className="text-yellow-500 mb-6" size={40} />
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">Recover Access</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Zurich Mainnet Security Hub</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">Registry Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="email" required
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-yellow-500 transition-all"
                placeholder="identity@trustra.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-yellow-500 hover:bg-white text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 italic uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Request Cipher <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
