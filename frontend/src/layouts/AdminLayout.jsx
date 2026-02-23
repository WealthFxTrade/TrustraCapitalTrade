import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, initialized } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05070a] text-white font-mono uppercase tracking-[0.4em] animate-pulse">
        Initializing Secure Admin Node...
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Nodes', path: '/admin/users', icon: Users },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: CreditCard },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <ShieldCheck className="h-8 w-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
          <div>
            <span className="block text-lg font-black uppercase italic tracking-tighter">Trustra</span>
            <span className="block text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Oversight v8.4</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          // Exact match for overview, startsWith for others
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin' 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
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

      <div className="p-6 border-t border-white/5 bg-[#0a0d14]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-[#0a0d14] border-r border-white/5 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-[#0a0d14] border-r border-white/5 z-[70] flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Mobile Navbar */}
        <div className="lg:hidden p-4 bg-[#0a0d14]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-indigo-500">
            <Menu size={24} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Admin Control Node</span>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>

        {/* Dynamic Route Container */}
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
