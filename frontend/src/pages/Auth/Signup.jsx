// src/pages/Auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Loader2, Gift } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isAuthenticated, initialized } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: searchParams.get('invite') || '',
  });

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const values = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      inviteCode: formData.inviteCode.trim(),
    };

    if (!values.name) return toast.error('Full name is required'), false;
    if (!values.username) return toast.error('Username is required'), false;
    if (values.username.length < 3) return toast.error('Username must be at least 3 characters'), false;
    if (!/^[a-zA-Z0-9_]+$/.test(values.username)) return toast.error('Username can only contain letters, numbers and underscore'), false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) return toast.error('Please enter a valid Node email'), false;

    if (values.phone && !/^\+?\d{9,15}$/.test(values.phone)) return toast.error('Please enter a valid phone number'), false;

    if (!values.password) return toast.error('Node Cipher is required'), false;
    if (values.password.length < 8) return toast.error('Cipher must be at least 8 characters'), false;
    if (values.password !== values.confirmPassword) return toast.error('Ciphers do not match'), false;

    if (!agreed) return toast.error('You must accept the terms and risk disclosure'), false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading('Initializing Node...');

    try {
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password.trim(),
        referredByCode: formData.inviteCode.trim().toUpperCase() || undefined,
      };

      const response = await signup(payload);

      if (response?.success) {
        toast.success('Node Initialized Successfully', { id: toastId });
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Signup returned unsuccessful result');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Handshake failed. Please check your Node details.';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Initialize <span className="text-yellow-500">Node</span>
          </h1>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="johndoe88"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Node Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="node@trustra.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone (International)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="+1..."
                />
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Node Cipher</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Cipher</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Invite Code */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Invite Code (Optional)</label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  disabled={loading || searchParams.get('invite')}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed text-yellow-500 font-bold"
                  placeholder="REFERRAL-CODE"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                disabled={loading}
                className="mt-1 accent-yellow-500"
              />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                I acknowledge the <span className="text-white">Risk Disclosure</span> and agree to the 2026 automated trading protocol.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-tighter shadow-lg shadow-yellow-500/10"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Node <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Already have a Node?{' '}
              <Link to="/login" className="text-yellow-500 font-bold hover:underline">
                Access Node
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
