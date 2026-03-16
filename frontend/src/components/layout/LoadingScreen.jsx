import React from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl animate-pulse" />
        {/* Spinning loader */}
        <div className="w-16 h-16 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin" />
      </div>
      <p className="mt-8 text-lg font-medium uppercase tracking-widest text-yellow-500">
        {message}
      </p>
    </div>
  );
}
