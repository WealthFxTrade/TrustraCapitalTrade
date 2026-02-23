import React from 'react';

export default function Users() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-white mb-4">User Nodes</h1>
      <p className="text-slate-400 text-sm">
        This is where you can manage all user nodes and see their activity.
      </p>

      {/* TODO: Add table or cards to display users */}
      <div className="mt-6 bg-[#0a0d14] p-4 rounded-xl border border-white/5">
        <p className="text-slate-500">User list will appear here.</p>
      </div>
    </div>
  );
}
