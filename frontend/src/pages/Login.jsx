import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { TrendingUp, Mail, Lock, RefreshCw, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents page reload
    if (!email || !password) return toast.error("Please fill all fields");
    
    setLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Access Granted');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] min-h-screen text-white flex flex-col justify-center px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="flex justify-center mb-6"><TrendingUp className="h-10 w-10 text-blue-500" /></div>
        <h2 className="text-3xl font-black uppercase italic">Sign In</h2>
        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Secure Portfolio Access</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition"
                  placeholder="investor@trustra.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="password" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <>Login <ChevronRight size={16}/></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            No account? <Link to="/register" className="text-white font-bold hover:text-blue-500 underline">Register here</Link>
          </p>
        </div>
        
        <p className="mt-10 text-center text-[9px] font-bold text-slate-700 uppercase tracking-widest">
          © 2016–2026 Trustra Capital Trade • SSL Encrypted
        </p>
      </div>
    </div>
  );
}

