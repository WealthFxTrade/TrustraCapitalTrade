import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Activity, 
  ScrollText, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success("Session Terminated");
    navigate('/login');
  };

  const navItems = [
    { label: 'Command Center', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Identity Registry', path: '/admin/users', icon: Users },
    { label: 'Withdrawal Queue', path: '/admin/withdrawals', icon: Wallet },
    { label: 'Global Ledger', path: '/admin/ledger', icon: ScrollText },
    { label: 'System Health', path: '/admin/health', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-[#020408]">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 fixed h-full bg-[#020408] z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <ShieldCheck className="text-black" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter text-white">Trustra Admin</h1>
            <p className="text-[8px] font-black text-yellow-500 uppercase tracking-[0.3em]">Zurich Mainnet</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group
                ${isActive 
                  ? 'bg-yellow-500 text-black font-black italic' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white font-bold'}
              `}
            >
              <item.icon size={18} />
              <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── SYSTEM STATUS ── */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Node Synchronized</span>
            </div>
            <p className="text-[7px] text-gray-600 font-mono leading-tight">
              SECURE_SSL: AES-256-GCM<br/>
              LATENCY: 14ms
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN VIEWPORT ── */}
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
