// src/pages/Auth/Signup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck, Mail, Lock, User, Phone,
  ArrowRight, Loader2, Gift // Added Gift icon for referral feedback
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Catch the URL params
  const { signup, isAuthenticated, initialized } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '', // Added username field to match User model requirements
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: searchParams.get('invite') || '' // Auto-capture ?invite=CODE
  });

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!agreed) {
      return toast.error('You must accept the terms and risk disclosure');
    }

    setLoading(true);
    try {
      // Updated signup call to include username and inviteCode
      await signup({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        inviteCode: formData.inviteCode.toUpperCase()
      });

      toast.success('Node Synchronized. Welcome to Trustra Capital Trade.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Handshake failed. Check credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
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
            
            {/* NAME & USERNAME GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Full Name</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-yellow-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Username</label>
                <input name="username" type="text" required value={formData.username} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-yellow-500 outline-none transition-all" />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Email Protocol</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-yellow-500 outline-none transition-all" />
            </div>

            {/* INVITE CODE (REFERRAL) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Invite Code (Optional)</label>
              <div className="relative">
                <input 
                  name="inviteCode" 
                  type="text" 
                  value={formData.inviteCode} 
                  onChange={handleChange} 
                  placeholder="EX: TRSTR7"
                  className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white text-sm outline-none transition-all ${formData.inviteCode ? 'border-yellow-500/50' : 'border-white/10'}`} 
                />
                {formData.inviteCode && <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 w-4 h-4" />}
              </div>
            </div>

            {/* PASSWORD GRID */}
            <div className="grid grid-cols-2 gap-4">
              <input name="password" type="password" required placeholder="Password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-yellow-500 outline-none transition-all" />
              <input name="confirmPassword" type="password" required placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-yellow-500 outline-none transition-all" />
            </div>

            <div className="flex items-start gap-3 py-2">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="mt-1 accent-yellow-500" />
              <p className="text-[10px] text-gray-500 uppercase font-bold leading-tight">I acknowledge the risk disclosure and institutional terms.</p>
            </div>

            <button disabled={loading} className="w-full py-4 bg-yellow-500 text-black font-black uppercase italic rounded-2xl hover:bg-white transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Establish Connection'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
