import React from 'react';
import { 
  LayoutDashboard, Users, ShieldCheck, 
  ArrowDownCircle, ArrowUpCircle, Settings, 
  LogOut, Activity, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon: Icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group ${
      isActive 
        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' 
        : 'text-gray-500 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-4">
      <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-rose-500'} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    {badge > 0 && (
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
        isActive ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export default function AdminSidebar({ activeTab, setActiveTab, counts = {} }) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Terminal Home', icon: LayoutDashboard },
    { id: 'users', label: 'Node Management', icon: Users },
    { id: 'kyc', label: 'Identity Vault', icon: ShieldCheck, badge: counts.pendingKyc },
    { id: 'deposits', label: 'Ingress Audit', icon: ArrowDownCircle, badge: counts.pendingDeposits },
    { id: 'withdrawals', label: 'Egress Queue', icon: ArrowUpCircle, badge: counts.pendingWithdrawals },
  ];

  return (
    <div className="w-80 h-screen bg-[#05070a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      
      {/* PROTOCOL BRANDING */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
            <Database size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Trustra<span className="text-rose-600">Admin</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em]">
            Protocol Live: v2.4.0
          </span>
        </div>
      </div>

      

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-6 text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4 mt-4">
          Core Operations
        </p>
        
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            {...item}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        <div className="mt-10">
          <p className="px-6 text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4">
            System Config
          </p>
          <NavItem 
            icon={Settings} 
            label="Security Logic" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </div>
      </nav>

      {/* ADMIN PROFILE & LOGOUT */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black italic">
            AD
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-tighter text-white">Master Node</p>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Admin Authorization</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
        </button>
      </div>
    </div>
  );
}
