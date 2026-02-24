import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl animate-pulse"></div>
        
        {/* Spinning Loader */}
        <div className="w-12 h-12 border-2 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-yellow-500 font-black uppercase tracking-[0.4em] text-[10px]">
          Trustra Secure Node
        </span>
        <span className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[8px] animate-pulse">
          Establishing Encrypted Link...
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
