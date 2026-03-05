import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, CreditCard, ShieldCheck, 
  Activity, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'Investor Nodes', icon: Users, path: '/admin/users' },
  { id: 'withdrawals', label: 'Extraction Queue', icon: CreditCard, path: '/admin/withdrawals' },
  { id: 'security', label: 'Audit Logs', icon: ShieldCheck, path: '/admin/security' },
  { id: 'health', label: 'System Health', icon: Activity, path: '/admin/health' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#020408] text-white flex overflow-hidden font-sans">
      
      {/* ── SIDEBAR ── */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        className="relative z-50 bg-[#05070a] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out"
      >
        <div className="p-6 mb-8 flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-lg font-black italic tracking-tighter text-yellow-500"
              >
                TRUSTRA<span className="text-white">HQ</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                  isActive ? 'bg-yellow-500 text-black' : 'hover:bg-white/5 text-gray-500 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && (
                  <span className="text-xs font-black uppercase tracking-widest flex-1 text-left">
                    {item.label}
                  </span>
                )}
                {isActive && isSidebarOpen && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        
        {/* TOP HUD */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#020408]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            <span className="text-yellow-500">Master</span> / {location.pathname.split('/').pop()}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Server Live: Zurich-01</span>
            </div>
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-black text-xs">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* VIEWPORT FOR NESTED ROUTES */}
        <section className="p-8 lg:p-12">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
