import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, 
  LayoutDashboard, 
  LineChart, 
  Wallet, 
  History, 
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // logout function in Context already handles toast/navigate, 
              // but keeping it here for immediate UX feedback.
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/invest', label: 'Invest', icon: LineChart },
    { to: '/deposit', label: 'Deposit', icon: Wallet },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      {/* ─── Global Navigation ─── */}
      <nav className="bg-slate-900/40 border-b border-white/5 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg shadow-yellow-500/10">
                T
              </div>
              <span className="text-xl font-black tracking-tighter italic uppercase hidden sm:block">
                Trustra
              </span>
            </div>

            {/* Desktop Nav - Corrected Active States */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end border-r border-white/5 pr-4">
                <span className="text-[11px] font-black uppercase tracking-tight text-white">
                  {user?.fullName || 'Authorized Investor'}
                </span>
                <span className="text-[10px] font-bold text-yellow-500/80">
                  €{(user?.totalBalance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {/* Profile Avatar */}
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 font-black text-xs ring-2 ring-yellow-500/0 hover:ring-yellow-500/20 transition-all cursor-pointer">
                {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                title="Disconnect Node"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Navigation (Sticky Bottom for UX) ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-3xl border-t border-white/5 px-6 py-4 z-50 flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-yellow-500' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-20 md:mb-0">
        <div className="relative">
           {/* Subtle Background Glow for content */}
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full -z-10" />
           <Outlet /> 
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="border-t border-white/5 pt-8">
          <p className="text-[9px] text-slate-700 uppercase font-black tracking-[0.4em] leading-relaxed">
            Trustra Capital Trade • Secure Audit Node v8.4.1 • All Digital Asset Management involves risk
          </p>
        </div>
      </footer>
    </div>
  );
}
