export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-t-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 animate-pulse text-[10px] font-black uppercase tracking-[0.3em]">
          {message}
        </p>
      </div>
    </div>
  );
}
