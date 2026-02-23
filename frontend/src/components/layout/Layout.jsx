// components/Layout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { TrendingUp, LayoutDashboard, LineChart, Wallet, History, LogOut, User } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plans', label: 'Plans', icon: LineChart },
    { to: '/invest', label: 'Invest', icon: Wallet },
    { to: '/deposit', label: 'Deposit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Navbar */}
      <nav className="bg-slate-900/60 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-xl md:text-2xl font-black tracking-tighter italic uppercase">
                Trustra
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.fullName || 'Investor'}</span>
                <span className="text-xs text-slate-400">
                  €{user?.balance?.toLocaleString() || '0.00'}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                {(user?.fullName?.[0] || 'U').toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet /> {/* This renders the child pages: Dashboard, Plans, Invest, Deposit */}
      </main>

      {/* Optional Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        © 2016–2026 Trustra Capital Trade • All investments carry risk
      </footer>
    </div>
  );
}
