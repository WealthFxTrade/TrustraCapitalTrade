// src/components/layout/LoadingScreen.jsx
import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export default function LoadingScreen({ message = "Verifying your secure session..." }) {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500 p-4 rounded-2xl shadow-lg">
            <Zap size={48} className="text-black" fill="currentColor" />
          </div>
          <div>
            <span className="text-3xl font-black italic tracking-tighter text-white">TRUSTRA</span>
            <span className="text-3xl font-light italic tracking-tighter text-white/50">NODE</span>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-yellow-500" size={36} />
          <p className="text-yellow-500 font-medium text-lg tracking-widest">
            {message}
          </p>
          <p className="text-gray-500 text-sm">AES-256 Encrypted Terminal</p>
        </div>
      </div>
    </div>
  );
}
