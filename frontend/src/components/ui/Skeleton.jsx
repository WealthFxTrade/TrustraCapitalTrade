import React from 'react';

// The default export (General purpose)
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-800/50 rounded ${className}`}></div>
);

// The named export the Dashboard is asking for
export const SkeletonCard = () => (
  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export default Skeleton;
