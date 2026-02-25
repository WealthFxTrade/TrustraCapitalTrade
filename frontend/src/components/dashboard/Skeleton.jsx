// src/components/dashboard/Skeleton.jsx
import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 animate-pulse rounded-xl h-24 w-full shadow-lg"></div>
  );
}

export default function Skeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
