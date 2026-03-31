import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

export default function Header() {
  const { user, logout: contextLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    contextLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020408]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
      {/* Branding */}
      <Link to="/" className="flex items-center gap-3 group">
        <ShieldCheck className="text-emerald-500 group-hover:scale-110 transition-transform" size={28} />
        <span className="text-xl font-black tracking-tighter text-white uppercase italic">
          Trustra<span className="text-emerald-500">Capital</span>
        </span>
      </Link>

      {/* Action Navigation */}
      <nav className="flex items-center gap-8">
        {user ? (
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              <LayoutDashboard size={14} className="text-emerald-500" />
              Node Terminal
            </Link>

            {(user.isAdmin || user.role === 'admin') && (
              <Link 
                to="/admin" 
                className="text-[10px] font-black uppercase tracking-widest text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full bg-rose-500/5 hover:bg-rose-500/10 transition-all"
              >
                Root Access
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all"
            >
              <LogOut size={14} className="text-rose-500" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-400 transition-all"
            >
              <LogIn size={14} />
              Client Login
            </Link>
            
            <Link
              to="/register"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              <UserPlus size={14} />
              Open Node
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
