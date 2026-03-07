import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Banknote, 
  History, 
  Activity, 
  LogOut, 
  ChevronRight, 
  ShieldAlert,
  Menu, 
  X,
  Cpu,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * AdminLayout - The central Command Shell for Zurich Mainnet.
 * Handles responsive navigation, session security, and global UI state.
 */
export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Responsive Breakpoints (1024px for Desktop/Tablet split)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Infrastructure', path: '/admin/health', icon: Activity },
    { name: 'Investor Registry', path: '/admin/users', icon: Users },
    { name: 'Payout Pipeline', path: '/admin/withdrawals', icon: Banknote },
    { name: 'Global Ledger', path: '/admin/ledger', icon: History },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Admin Session Terminated', {
      icon: '🔒',
      style: { background: '#0A0C10', color: '#fff', border: '1px solid #333' }
    });
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[#020408] text-white overflow-hidden font-sans">
      
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
          bg-[#06080C] border-r border-white/5 flex flex-col shadow-2xl
        `}
      >
        {/* Branding Area */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5 min-h-[90px]">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <ShieldAlert className="text-black w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black italic tracking-tighter text-xl uppercase">
                Zurich <span className="text-yellow-500">Mainnet</span>
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-bold">
                Control Plane v3.0
              </span>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border
                  ${active 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 font-bold shadow-lg shadow-yellow-500/5' 
                    : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon size={20} className={active ? 'text-yellow-500' : 'group-hover:text-yellow-500'} />
                {isSidebarOpen && (
                  <span className="text-xs uppercase tracking-widest flex-1">{item.name}</span>
                )}
                {active && isSidebarOpen && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility Bar */}
        <div className="p-4 border-t border-white/5 bg-[#040508]">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hidden lg:flex"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest font-black">Collapse Menu</span>}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all mt-1"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest font-black">Terminate Node</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN VIEWPORT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Status Bar (Dynamic Header) */}
        <header className="h-[90px] border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-[#020408]/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg">
                <Menu size={20} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Protocol Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-600" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Zurich-Node-01</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-xs font-black uppercase italic tracking-tighter">System Administrator</span>
              <span className="text-[10px] text-yellow-500/80 font-mono">root@zurich-mainnet</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold">A</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative custom-scrollbar">
          {/* Subtle background glow for aesthetics */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
