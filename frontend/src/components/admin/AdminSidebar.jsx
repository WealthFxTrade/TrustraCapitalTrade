// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  LogOut,
  Database,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NavItem = ({ icon: Icon, label, path, badge, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
      isActive
        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-4">
      <Icon 
        size={18} 
        className={isActive ? 'text-black' : 'group-hover:text-emerald-500'} 
      />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>

    {badge > 0 && (
      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
        isActive 
          ? 'bg-black text-emerald-500' 
          : 'bg-emerald-500 text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Terminal Home', 
      icon: LayoutDashboard 
    },
    { 
      path: '/admin/users', 
      label: 'Node Management', 
      icon: Users 
    },
    { 
      path: '/admin/kyc', 
      label: 'Identity Vault', 
      icon: ShieldCheck,
      // badge will be passed from parent if needed
    },
    { 
      path: '/admin/deposits', 
      label: 'Ingress Audit', 
      icon: ArrowDownCircle 
    },
    { 
      path: '/admin/withdrawals', 
      label: 'Egress Queue', 
      icon: ArrowUpCircle 
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose(); // Close mobile sidebar
  };

  const handleLogout = async () => {
    if (window.confirm('Terminate Admin Session?')) {
      await logout();
    }
  };

  return (
    <div className="w-80 h-screen bg-[#05070a] border-r border-white/10 flex flex-col">

      {/* Branding */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Database size={20} className="text-black" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">
            Trustra<span className="text-emerald-500">Admin</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4">
          CORE OPERATIONS
        </p>

        {menuItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
          />
        ))}

        {/* System Config Section */}
        <div className="pt-8">
          <p className="px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4">
            SYSTEM CONFIG
          </p>
          <NavItem
            icon={Settings}
            label="Security Logic"
            path="/admin/settings"
            isActive={location.pathname === '/admin/settings'}
            onClick={() => handleNavClick('/admin/settings')}
          />
        </div>
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            TERMINATE SESSION
          </span>
        </button>
      </div>
    </div>
  );
}
