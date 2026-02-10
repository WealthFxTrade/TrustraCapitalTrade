import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Nodes', path: '/admin/users', icon: Users },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: CreditCard },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-[#0a0d14] border-b border-white/5 flex justify-between items-center">
        <ShieldCheck className="text-indigo-500" />
        <span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
        <div className="flex items-center gap-2">
          <button onClick={logout} className="text-red-500">
            <LogOut size={18} />
          </button>
          <button onClick={toggleSidebar} className="text-white">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-72 bg-[#0a0d14] border-r border-white/5 flex flex-col transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
            <ShieldCheck className="h-8 w-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
            <div>
              <span className="block text-lg font-black uppercase italic tracking-tighter">Trustra</span>
              <span className="block text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Admin Node</span>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
                onClick={() => setIsOpen(false)} // Close on mobile
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? 'text-white' : 'group-hover:text-indigo-400'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
