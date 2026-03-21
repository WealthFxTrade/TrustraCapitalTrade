// src/pages/Auth/TemplateAuth.jsx
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Loader2, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthTemplate({
  type,             // 'login', 'signup', 'forgot'
  onSubmit,         // async function handling submit
  initialData = {}, // prefill form
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false); // for signup

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData, agreed);
    } catch (err) {
      toast.error(err.message || 'Error occurred');
      console.error('[AUTH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    let title, subtitle;
    if (type === 'login') {
      title = 'Sign In';
      subtitle = 'Access your Trustra Capital account';
    } else if (type === 'signup') {
      title = 'Initialize Node';
      subtitle = 'Create your TrustraCapitalTrade account';
    } else if (type === 'forgot') {
      title = 'Recover Access';
      subtitle = 'TrustraCapitalTrade Security Hub';
    }
    return (
      <div className="text-center mb-8">
        <ShieldCheck className="text-yellow-500 mx-auto mb-4" size={40} />
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">{title}</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    );
  };

  const renderInputs = () => {
    if (type === 'login') {
      return (
        <>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">Email Protocol</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="node@trustra.com"
                required
                disabled={loading}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1 block">Cipher</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </>
      );
    }

    if (type === 'signup') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                placeholder="johndoe88"
                required
                disabled={loading}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Protocol</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="node@trustra.com"
                required
                disabled={loading}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Cipher</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          {/* Optional Invite */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Invite Code (Optional)</label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode || ''}
                onChange={handleChange}
                placeholder="REFERRAL-CODE"
                disabled={loading}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed text-yellow-500 font-bold"
              />
            </div>
          </div>
          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 py-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              disabled={loading}
              className="mt-1 accent-yellow-500"
            />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              I acknowledge the <span className="text-white">Risk Disclosure</span> and agree to the 2026 automated trading protocols.
            </p>
          </div>
        </>
      );
    }

    if (type === 'forgot') {
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Registry Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="identity@trustra.com"
              required
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] p-6">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        {renderHeader()}
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderInputs()}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 italic uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Submit <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {type !== 'login' && (
            <span
              onClick={() => navigate('/login')}
              className="text-yellow-500 font-bold hover:underline cursor-pointer"
            >
              Sign In
            </span>
          )}
          {type !== 'signup' && (
            <span
              onClick={() => navigate('/register')}
              className="ml-2 text-yellow-500 font-bold hover:underline cursor-pointer"
            >
              Create Account
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
