import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  ShieldCheck,
  LifeBuoy,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: <Wallet size={18} /> },
    { name: 'KYC', path: '/admin/kyc', icon: <ShieldCheck size={18} /> },
    { name: 'Ledger', path: '/admin/ledger', icon: <Activity size={18} /> },
    { name: 'System Health', path: '/admin/health', icon: <Settings size={18} /> },
    { name: 'Support', path: '/admin/support', icon: <LifeBuoy size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Admin logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white">
      {/* SIDEBAR */}
      <div
        className={`bg-[#0a0c10] border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
            <h1 className={`font-black text-xl uppercase tracking-widest ${!sidebarOpen && 'opacity-0'}`}>
              Admin
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-yellow-500 focus:outline-none"
            >
              ☰
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-sm font-black uppercase tracking-wider transition-colors ${
                    isActive ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/5 text-white/60'
                  }`
                }
              >
                {item.icon}
                <span className={`${!sidebarOpen && 'hidden'}`}>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* LOGOUT */}
          <div className="px-4 py-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={18} /> <span className={`${!sidebarOpen && 'hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
