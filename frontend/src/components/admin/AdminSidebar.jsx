import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, CreditCard, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function AdminSidebar() {
  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-white/5 p-6 space-y-8 hidden lg:block">
      <div className="flex items-center gap-2 mb-10">
        <ShieldCheck className="text-indigo-500" size={24} />
        <span className="font-black uppercase italic tracking-tighter">Admin Console</span>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `flex items-center gap-3 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <link.icon size={16} /> {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

