// src/pages/Auth/Login.jsx - Production v8.4.1
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Zap, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Identity Verified. Access Granted.");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Authentication Failed: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/5">
            <Zap className="text-yellow-500" size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">System Access</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Trustra Capital • Secure Terminal</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Protocol Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500 transition-all outline-none placeholder:text-gray-800"
                  placeholder="investor@trustra.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Access Cipher</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500 transition-all outline-none placeholder:text-gray-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-yellow-500/10"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Session <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/register" className="text-[10px] font-black text-gray-600 hover:text-yellow-500 uppercase tracking-widest transition-colors">
              Request New Allocation Hub? <span className="text-white">Sign Up</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 opacity-20">
          <ShieldCheck size={14} />
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">AES-256 Encrypted Session</p>
        </div>
      </div>
    </div>
  );
}
