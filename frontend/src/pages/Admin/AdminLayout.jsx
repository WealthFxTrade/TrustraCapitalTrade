// src/pages/Admin/AdminLayout.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ScrollText,
  Activity,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin session terminated successfully");
      navigate('/login');
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const navItems = [
    { 
      label: 'Command Center', 
      path: '/admin/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Identity Registry', 
      path: '/admin/users', 
      icon: Users 
    },
    { 
      label: 'Withdrawal Queue', 
      path: '/admin/withdrawals', 
      icon: Wallet 
    },
    { 
      label: 'Global Ledger', 
      path: '/admin/ledger', 
      icon: ScrollText 
    },
    { 
      label: 'System Health', 
      path: '/admin/health', 
      icon: Activity 
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-sans">
      {/* Fixed Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#020408] flex flex-col fixed h-full z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-8 border-b border-white/5">
          <div className="bg-yellow-500 p-3 rounded-2xl">
            <ShieldCheck className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Trustra Admin</h1>
            <p className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em]">Zurich Control Node</p>
          </div>
        </div>

        {/* Admin Info */}
        <div className="px-8 py-6 border-b border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Logged in as</div>
          <div className="font-mono text-sm text-yellow-400">{user?.username || 'ADMIN'}</div>
          <div className="text-[9px] text-emerald-500 font-black">● FULL ACCESS GRANTED</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group text-sm
                ${isActive 
                  ? 'bg-yellow-500 text-black font-black shadow-xl shadow-yellow-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon size={20} className={isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'} />
              <span className="uppercase tracking-[0.05em] text-[10px] font-black">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Status & Logout */}
        <div className="mt-auto p-6 border-t border-white/5 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-[10px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-black uppercase tracking-widest text-emerald-500">LIVE NODE SYNC</span>
            </div>
            <div className="font-mono text-[9px] text-gray-600 leading-tight">
              AES-256-GCM • LATENCY: &lt;20ms<br />
              LAST SYNC: JUST NOW
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
          >
            <LogOut size={18} />
            TERMINATE ADMIN SESSION
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
