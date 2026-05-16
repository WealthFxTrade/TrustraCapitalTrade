// src/pages/Admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#020408] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional Top Bar / Header */}
        <div className="h-14 border-b border-white/10 bg-[#0a0c10] flex items-center px-6 justify-between flex-shrink-0">
          <div className="font-black uppercase tracking-widest text-sm text-emerald-500">
            ADMIN CONTROL PANEL
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {/* You can add user info, notifications, logout etc. here later */}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
