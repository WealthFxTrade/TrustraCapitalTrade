// src/pages/Admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020408] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#0a0c10] flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={26} />
            </button>

            <div className="font-black uppercase tracking-[2px] text-sm text-emerald-500">
              ADMIN CONTROL PANEL
            </div>
          </div>

          <div className="text-xs text-gray-500 hidden sm:block">
            Trustra Capital • Institutional Systems
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
