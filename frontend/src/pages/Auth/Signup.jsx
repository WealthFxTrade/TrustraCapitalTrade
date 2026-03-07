
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, initialized } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // ── REDIRECT IF ALREADY ON MAINNET ──
  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Security keys do not match");
    }

    if (!agreed) {
      return toast.error("Accept the Risk Disclosure to proceed");
    }

    setLoading(true);

    try {
      // Hits the SIGNUP: '/auth/register' endpoint defined in constants
      await signup(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.phone
      );

      toast.success("Account Initialized Successfully");
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || "Node Synchronization Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)]">
            <ShieldCheck className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Initialize <span className="text-yellow-500 text-not-italic">Node</span>
          </h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold">
            Trustra Capital Trade • 2026 Protocol
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/5 blur-[80px] rounded-full group-hover:bg-yellow-500/10 transition-all duration-700" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Identity</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Network Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Secure Contact</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="+1 (000) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-yellow-500/50 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Secure Key</label>
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-yellow-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Confirm</label>
                <input
                  required
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-yellow-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={() => setAgreed(!agreed)}
                className="w-4 h-4 bg-black border-white/10 rounded accent-yellow-500 cursor-pointer"
              />
              <p className="text-[10px] text-gray-500 leading-tight">
                I agree to the <span className="text-gray-300">Institutional Risk Protocol</span> and system terms.
              </p>
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50 shadow-[0_10px_30px_-10px_rgba(234,179,8,0.4)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              Already verified?{' '}
              <Link to="/login" className="text-yellow-500 font-black hover:underline ml-1">
                ACCESS VAULT
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
