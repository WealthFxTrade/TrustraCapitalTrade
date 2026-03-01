import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      toast.success("Account Protocol Created.");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Protocol Rejection: Email in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 md:p-6 font-sans overflow-y-auto">
      <div className="w-full max-w-md space-y-6 md:space-y-8 py-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">New Allocation</h1>
          <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Initialize Protocol</p>
        </div>

        <div className="bg-[#0a0c10]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Investor Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  required
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="Full Name"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  required
                  type="email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="investor@trustra.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Access Cipher</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  required
                  type="password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 md:py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all mt-4">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Hub <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-[0.15em]">
              Already Registered? <span className="text-yellow-500 underline decoration-2 underline-offset-4 ml-1">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
