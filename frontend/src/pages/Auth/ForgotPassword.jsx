import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/api.js'; // Use your intercepted axios instance
import { TrendingUp, Phone, Lock, RefreshCw, KeyRound, ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    password: '',
  });

  const navigate = useNavigate();

  // Step 1: Request OTP via SMS (Matches router.post('/forgot-password') in auth.js)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phone.trim()) return toast.error('Phone number is required');
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone: formData.phone });
      toast.success('Security code sent to your mobile device');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and New Password (Matches router.post('/reset-password-otp'))
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.otp.length < 6) return toast.error('Enter the 6-digit code');
    
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password-otp', formData);
      toast.success('Password synchronized successfully');
      
      // Auto-login: Store session and move to dashboard
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
          Account Recovery
        </h2>
        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
          Secure Trustra Node Reset
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Step 01: Identification</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter your registered phone number to receive a temporary authentication code.
                </p>
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Request Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-blue-400 text-xs uppercase tracking-widest font-bold">Step 02: Verification</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter the 6-digit code and create your new secure access credentials.
                </p>
              </div>

              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Verification Code"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 font-mono tracking-[0.5em]"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  placeholder="New Secure Password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Update & Unlock Dashboard'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ChevronLeft size={14} /> Back to Entry Point
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

