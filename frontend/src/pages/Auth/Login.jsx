import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { Mail, Lock, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const passwordRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) return toast.error('Credentials required');

    try {
      const res = await api.post('/auth/login', { email: trimmedEmail, password });
      
      // FIX: Ensure we extract the exact user object and token
      const userData = res.data.user || res.data.data;
      const token = res.data.token;

      if (!userData || !token) {
        throw new Error('Invalid server response');
      }

      // Context handles navigation and localStorage
      login(userData, token);
      toast.success('Access Granted');
    } catch (err) {
      setPassword('');
      passwordRef.current?.focus();
      // Error toast is handled by api.js interceptor!
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="email"
                placeholder="INVESTOR@TRUSTRA.COM"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                ref={passwordRef}
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-white outline-none focus:border-yellow-600/50 text-[10px] font-black uppercase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-yellow-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span>Authenticate Access</span>
              <ChevronRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
