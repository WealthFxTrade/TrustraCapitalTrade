// src/pages/Auth/Signup.jsx - Production v8.4.1
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Zap, Loader2, Shield, ArrowRight } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', formData);
      toast.success("Protocol Initialized. Welcome to Trustra.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20">
            <Shield className="text-yellow-500" size={32} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">New Allocation</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Create Investor Hub • Trustra Capital</p>
        </div>

        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 shadow-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Investor Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  required
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500 transition-all outline-none"
                  placeholder="Full Legal Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email Identifier</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500 transition-all outline-none"
                  placeholder="contact@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Security Cipher</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  required
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-yellow-500 transition-all outline-none"
                  placeholder="Create Secure Password"
                />
              </div>
            </div>

            <div className="pt-2 flex items-start gap-3">
              <input type="checkbox" required className="mt-1 accent-yellow-500" />
              <p className="text-[9px] font-bold text-gray-600 uppercase leading-relaxed tracking-wider">
                I agree to the <span className="text-white">Audit Protocols v8.4.1</span> and acknowledge capital volatility.
              </p>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-yellow-500 hover:bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-yellow-500/10"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Generate Account <Zap size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] font-black text-gray-600 hover:text-yellow-500 uppercase tracking-widest transition-colors">
              Already possess credentials? <span className="text-white">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
